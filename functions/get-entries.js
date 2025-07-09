// functions/get-entries.js
const fetch = require('node-fetch');

exports.handler = async function(event, context) {
  const NOTION_TOKEN = process.env.NOTION_TOKEN;
  const DATABASE_ID = "1ddafb7d-2f2c-8011-bd3bd49c4b562775";

  const url = `https://api.notion.com/v1/databases/${DATABASE_ID}/query`;
  const response = await fetch(url, {
    method: "POST",
    headers: {
      "Authorization": `Bearer ${NOTION_TOKEN}`,
      "Notion-Version": "2022-06-28",
      "Content-Type": "application/json",
    },
    body: JSON.stringify({})
  });

  if (!response.ok) {
    // surface Notion’s error for easier debugging
    const err = await response.json();
    return { statusCode: response.status, body: JSON.stringify(err) };
  }

  const data = await response.json();
  const entries = (data.results || []).map(page => {
    const name = page.properties["Full Name"]?.title?.[0]?.text?.content || "";
    const company = page.properties["Company/Organization"]?.rich_text?.[0]?.text?.content || "";
    return { name, company };
  }).filter(e => e.name && e.company);

  return {
    statusCode: 200,
    body: JSON.stringify(entries)
  };
};
