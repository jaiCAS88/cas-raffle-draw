const fetch = require('node-fetch');

exports.handler = async function(event, context) {
  const NOTION_TOKEN = "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";
  const DATABASE_ID  = "your-real-database-id-here";
  const url          = `https://api.notion.com/v1/databases/${DATABASE_ID}/query`;
  const headers      = {
    "Authorization": `Bearer ${NOTION_TOKEN}`,
    "Notion-Version": "2022-06-28",
    "Content-Type": "application/json",
  };

  try {
    let allPages = [];
    let cursor   = undefined;

    // Fetch loop
    do {
      const body = cursor
        ? { start_cursor: cursor }
        : {};
      const res = await fetch(url, {
        method: "POST",
        headers,
        body: JSON.stringify(body)
      });
      if (!res.ok) {
        const err = await res.text();
        throw new Error(`Notion API ${res.status}: ${err}`);
      }
      const data = await res.json();
      allPages = allPages.concat(data.results);
      cursor   = data.has_more ? data.next_cursor : undefined;
    } while (cursor);

    // Extract name/email/company — same as before
    const unique = {};
    allPages.forEach(page => {
      const nameProp    = page.properties["Full Name"]?.title;
      const companyProp = page.properties["Company/Organization"]?.rich_text;
      const emailProp   = page.properties["Email"]?.email;

      const name    = nameProp && nameProp.length
                      ? nameProp[0].text.content
                      : "";
      const company = companyProp && companyProp.length
                      ? companyProp[0].text.content
                      : "";
      const email   = emailProp || "";

      if (name && email) {
        unique[name + "|" + email] = { name, email, company };
      }
    });

    return {
      statusCode: 200,
      body: JSON.stringify(Object.values(unique)),
    };

  } catch (err) {
    console.error("Error fetching Notion pages:", err);
    return {
      statusCode: 500,
      body: JSON.stringify({ error: err.message }),
    };
  }
};
