const fetch = require('node-fetch');

exports.handler = async function(event, context) {
  const NOTION_TOKEN = "secret_ntn_471689582529o9a5qd7XRo1OlPmukqqFkbGWsakb4qFbXw";
  const DATABASE_ID = "1ddafb7d2f2c8011bd3bd49c4b562775";

  const url = `https://api.notion.com/v1/databases/${DATABASE_ID}/query`;
  const res = await fetch(url, {
    method: "POST",
    headers: {
      "Authorization": `Bearer ${NOTION_TOKEN}`,
      "Notion-Version": "2022-06-28",
      "Content-Type": "application/json"
    },
    body: JSON.stringify({})
  });

  if (!res.ok) {
    const err = await res.json();
    return { statusCode: res.status, body: JSON.stringify(err) };
  }

  const data = await res.json();

  // Map only Full Name + Company/Organization
  const entries = data.results.map(page => {
    const name = page.properties["Full Name"]?.title?.[0]?.text?.content || "";
    const company = page.properties["Company/Organization"]?.rich_text?.[0]?.text?.content
                 || "";
    return { name, company };
  }).filter(e => e.name && e.company);

  return {
    statusCode: 200,
    body: JSON.stringify(entries)
  };
};
