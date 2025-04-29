const fetch = require('node-fetch');

exports.handler = async function(event, context) {
  const NOTION_TOKEN = "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";
  const DATABASE_ID = "1deafb7d2f2c80c2823cdec6182886f1";

  const url = `https://api.notion.com/v1/databases/${DATABASE_ID}/query`;

  try {
    const response = await fetch(url, {
      console.log("NOTION API RESPONSE:", JSON.stringify(data, null, 2)),
      method: "POST",
      headers: {
        "Authorization": `Bearer ${NOTION_TOKEN}`,
        "Notion-Version": "2022-06-28",
        "Content-Type": "application/json",
      },
      body: JSON.stringify({})
    });

    const data = await response.json();
    
    const names = data.results.map(page => {
      const name = page.properties["Full Name"].title[0]?.text.content;
      const email = page.properties["Email"].email;
      return { name, email };
    }).filter(entry => entry.name && entry.email);

    // Remove duplicates
    const unique = {};
    names.forEach(entry => {
      unique[entry.name + entry.email] = entry;
    });

    return {
      statusCode: 200,
      body: JSON.stringify(Object.values(unique)),
    };
  } catch (error) {
    return {
      statusCode: 500,
      body: JSON.stringify({ error: error.message }),
    };
  }
};
