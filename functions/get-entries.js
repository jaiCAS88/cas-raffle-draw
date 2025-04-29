const fetch = require('node-fetch');

exports.handler = async function(event, context) {
  const NOTION_TOKEN = "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";
  const DATABASE_ID = "1deafb7d-2f2c-80e9-9a1a-c992416cec72";

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
    console.log("NOTION API RESPONSE:", JSON.stringify(data, null, 2));

    let names = [];

    if (data.results && Array.isArray(data.results)) {
      names = data.results.map(page => {
        let name = "";
        let email = "";

        if (page.properties 
          && page.properties["Full Name"] 
          && page.properties["Full Name"].title 
          && page.properties["Full Name"].title.length > 0 
          && page.properties["Full Name"].title[0].text) {
          name = page.properties["Full Name"].title[0].text.content;
        }

        if (page.properties 
          && page.properties["Email"] 
          && page.properties["Email"].email) {
          email = page.properties["Email"].email;
        }

        return { name, email };
      }).filter(entry => entry.name && entry.email);
    }

    const unique = {};
    names.forEach(entry => {
      unique[entry.name + entry.email] = entry;
    });

    return {
      statusCode: 200,
      headers: {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Headers": "Content-Type",
      },
      body: JSON.stringify(Object.values(unique)),
    };

  } catch (error) {
    console.error("Error:", error);

    return {
      statusCode: 500,
      headers: {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Headers": "Content-Type",
      },
      body: JSON.stringify({ error: error.message }),
    };
  }
};
