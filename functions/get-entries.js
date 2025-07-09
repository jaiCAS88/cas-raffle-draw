const fetch = require('node-fetch');

exports.handler = async function(event, context) {
  const NOTION_TOKEN = process.env.NOTION_TOKEN;
  const DATABASE_ID = "1ddafb7d2f2c8011bd3bd49c4b562775"; // Replace with your actual Notion DB ID

  const url = `https://api.notion.com/v1/databases/${DATABASE_ID}/query`;

  try {
    const response = await fetch(url, {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${NOTION_TOKEN}`,
        "Notion-Version": "2022-06-28",
        "Content-Type": "application/json",
      },
      body: JSON.stringify({})
    });

    const data = await response.json();

    const results = data.results.map(page => {
      const fullName = page.properties["Full Name"]?.title?.[0]?.text?.content || "";
      const company = page.properties["Company/Organization"]?.rich_text?.[0]?.text?.content || "";
      return { name: fullName, company };
    }).filter(person => person.name && person.company);

    return {
      statusCode: 200,
      body: JSON.stringify(results),
    };

  } catch (error) {
    return {
      statusCode: 500,
      body: JSON.stringify({ error: error.message }),
    };
  }
};
