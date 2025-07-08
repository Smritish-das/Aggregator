require("dotenv").config();
const cron = require("node-cron");
const axios = require("axios");
const articleModel = require("../models/article.model");

const VALID_CATEGORIES = [
  "Technology",
  "Business",
  "Entertainment",
  "Environment",
  "Finance",
  "Political",
];

async function getSummary(articles) {
  try {
    const prompt = `You are an expert summarizer. Using only the provided URLs, summarize each news article in 100 words or fewer. Return a JSON array of summaries in the same order.\n\n` +
      articles
        .map((a, i) => `${i + 1}. Title: ${a.title}\nURL: ${a.url || "N/A"}`)
        .join("\n\n");

    const response = await axios.post(
      "https://api.x.ai/v1/chat/completions",
      {
        model: "grok-3",
        messages: [{ role: "user", content: prompt }],
        max_tokens: articles.length * 100,
      },
      {
        headers: {
          Authorization: `Bearer ${process.env.GROK_API_KEY}`,
          "Content-Type": "application/json",
        },
      }
    );

    return JSON.parse(response.data.choices[0].message.content.trim());
  } catch (error) {
    console.error("Error in Grok API call:", error.message);
    return articles.map(() => null);
  }
}

async function startJobs() {
  cron.schedule("30 18 * * *", async () => {
    const day = new Date();
    day.setDate(day.getDate() - 7);

    try {
      await articleModel.deleteMany({});
      console.log("Cleared all articles from DB.");

      for (const category of VALID_CATEGORIES) {
        try {
          const res = await axios.get("https://gnews.io/api/v4/search", {
            params: {
              q: category,
              apiKey: process.env.NEWS_API_KEY,
              country: "in",
              from: day.toISOString().split("T")[0],
              language: "en",
              sortBy: "publishedAt",
              max: 10,
              in: "description",
            },
          });

          let articles = res.data.articles || [];
          if (!articles.length) {
            console.log(`No articles fetched for category: ${category}`);
            continue;
          }

          articles = articles.map((a) => ({ ...a, category }));

          const summaries = await getSummary(articles);

          for (let i = 0; i < articles.length; i++) {
            const a = articles[i];
            const summary = summaries[i] || a.description || "No summary available";

            try {
              await articleModel.create({
                heading: a.title || "Untitled",
                picture: a.image || null,
                author: a.source?.name || "Unknown",
                website_url: a.url,
                description: summary,
                category: a.category,
              });
            } catch (e) {
              console.error(`Error saving article ${a.url}:`, e.message);
            }
          }

          console.log(`Saved ${articles.length} articles for ${category}`);
        } catch (err) {
          console.error(`Error fetching for ${category}:`, err.message);
        }
      }
    } catch (e) {
      console.error("Job execution error:", e.message);
    }
  });
}

module.exports = startJobs;
