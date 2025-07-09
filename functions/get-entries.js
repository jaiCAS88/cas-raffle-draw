const fetch = require('node-fetch');

exports.handler = async function(event, context) {
  const NOTION_TOKEN = "your_secret_token_here";
  const DATABASE_ID = "1ddafb7d2f2c8011bd3bd49c4b562775";

  const url = `https://api.notion.com/v1/databases/${DATABASE_ID}/query`;

  try {
    const response = await fetch(url, {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${NOTION_TOKEN}`,
        "Notion-Version": "2022-06-28",
        "Content-Type": "application/json"
      },
      body: JSON.stringify({})
    });

    const data = await response.json();
    console.log("NOTION API RESPONSE:", JSON.stringify(data, null, 2));

    let names = [];

    if (data.results && Array.isArray(data.results)) {
      names = data.results.map(page => {
        const name = page.properties["Full Name"]?.title?.[0]?.text?.content || "";
        const company = page.properties["Company/Org"]?.rich_text?.[0]?.text?.content || "";
        return { name, company };
      });
    }

    return {
      statusCode: 200,
      body: JSON.stringify(names)
    };

  } catch (error) {
    return {
      statusCode: 500,
      body: JSON.stringify({ error: error.message })
    };
  }
};
