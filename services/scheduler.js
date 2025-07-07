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
  "Smart Home",
  "Social Media",
  "Retail",
];

async function categorizeArticles(articles) {
  try {
    const prompt = articles
      .map((article, index) => 
        `${index + 1}. "${article.title}. ${article.description || "No description available."}"`
      )
      .join('\n') + 
      `\nCategorize each article into one of these categories: ${VALID_CATEGORIES.join(", ")}. Return a JSON array of category names in the same order as the articles.`;

    const response = await axios.post(
      "https://api.x.ai/v1/chat/completions",
      {
        model: "grok-3",
        messages: [{ role: "user", content: prompt }],
        max_tokens: articles.length * 10,
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
    return articles.map(() => null); // Return null for each article on failure
  }
}

async function startJobs() {
  // Schedule for 12:00 AM IST (UTC+5:30, so 18:30 UTC)
  cron.schedule("30 18 * * *", async () => {
    try {
      const response = await axios.get("https://newsapi.org/v2/everything", {
        params: {
          q: "India",
          apiKey: process.env.NEWS_API_KEY,
          from: "2025-07-01",
          language: "en",
          sortBy: "popularity",
          pageSize: 100,
          page: 1,
        },
      });

      const articles = response.data.articles;
      if (!articles || articles.length === 0) {
        console.log("No articles fetched from NewsAPI");
        return;
      }

      // Check for existing articles
      const existingUrls = await articleModel
        .find({ website_url: { $in: articles.map(a => a.url) } })
        .select("website_url");
      const existingUrlSet = new Set(existingUrls.map(e => e.website_url));

      const newArticles = articles.filter(a => !existingUrlSet.has(a.url));
      if (newArticles.length === 0) {
        console.log("All articles already exist");
        return;
      }

      // Categorize all new articles in one API call
      const categories = await categorizeArticles(newArticles);

      // Save articles
      for (let i = 0; i < newArticles.length; i++) {
        try {
          const article = newArticles[i];
          const category = VALID_CATEGORIES.includes(categories[i]) ? categories[i] : "Uncategorized";

          await articleModel.create({
            heading: article.title || "Untitled",
            picture: article.urlToImage || null,
            author: article.author || "Unknown",
            website_url: article.url,
            description: article.description || null,
            category: category,
          });
        } catch (error) {
          console.error(`Error saving article ${newArticles[i].url}:`, error.message);
        }
      }
      console.log(`Processed ${newArticles.length} articles`);
    } catch (error) {
      console.error("Error in job execution:", error.message);
    }
  });
}

module.exports = startJobs;