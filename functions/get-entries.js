const fetch = require('node-fetch');

exports.handler = async (event, context) => {
  const NOTION_TOKEN = "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";
  const DATABASE_ID  = "1ddafb7d2f2c8037ace7e4f799d62fa1";  // ← your real DB ID
  const url          = `https://api.notion.com/v1/databases/${DATABASE_ID}/query`;
  const headers      = {
    "Authorization": `Bearer ${NOTION_TOKEN}`,
    "Notion-Version": "2022-06-28",
    "Content-Type": "application/json",
  };

  try {
    let allResults = [];
    let cursor     = undefined;

    // 1) Page through results
    do {
      const body = cursor
        ? { start_cursor: cursor }
        : {};
      const res = await fetch(url, {
        method: "POST",
        headers,
        body: JSON.stringify(body),
      });

      const text = await res.text();           // read raw text
      if (!res.ok) {
        console.error("Notion API error text:", text);
        throw new Error(`Notion ${res.status}: ${text}`);
      }

      const data = JSON.parse(text);
      allResults = allResults.concat(data.results);
      cursor     = data.has_more ? data.next_cursor : undefined;
    } while (cursor);

    // 2) Extract and dedupe entries
    const unique = {};
    allResults.forEach(page => {
      // name
      const nameProp = page.properties["Full Name"]?.title || [];
      const name     = nameProp.length
        ? nameProp[0].text.content
        : "";

      // email
      const email = page.properties["Email"]?.email || "";

      // company
      const compProp = page.properties["Company/Organization"]?.rich_text
                      || page.properties["Company/Organization"]?.title
                      || [];
      const company  = compProp.length
        ? compProp[0].text.content
        : "";

      // only if we have a name + email
      if (name && email) {
        unique[`${name}|${email}`] = { name, email, company };
      }
    });

    const entries = Object.values(unique);
    console.log(`Returning ${entries.length} unique entries`);
    return {
      statusCode: 200,
      body: JSON.stringify(entries),
    };

  } catch (err) {
    console.error("get-entries failed:", err);
    return {
      statusCode: 500,
      body: JSON.stringify({ error: err.message }),
    };
  }
};
