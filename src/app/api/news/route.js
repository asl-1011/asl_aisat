// src/app/api/news/route.js

export async function GET() {
  const url = "https://www.indiansuperleague.com/apiv4/listing?entities=5,1&otherent=&exclent=&pgnum=2&inum=12&pgsize=12";

  try {
    const response = await fetch(url);
    if (!response.ok) {
      return new Response(JSON.stringify({ error: "Failed to fetch data" }), {
        status: response.status,
        headers: { "Content-Type": "application/json" },
      });
    }

    const data = await response.json();
    const items = data?.content?.items || [];

    const transformedItems = items.map(item => ({
      _id: item.asset_id,
      imageUrl: "https://www.indiansuperleague.com/static-assets/waf-images/" + item.image_path + item.image_file_name + "?v=102.67&w=600",
      title: item.asset_title,
      description: item.short_desc,
    }));

    return new Response(JSON.stringify(transformedItems), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } catch (error) {
    return new Response(JSON.stringify({ error: "Something went wrong", details: error.message }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
}
