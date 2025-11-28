import { serve } from "https://deno.land/std/http/server.ts";

serve(async (req) => {
  try {
    const { photo_reference } = await req.json();

    if (!photo_reference) {
      return new Response(
        JSON.stringify({ error: "Missing photo_reference" }),
        { status: 400 }
      );
    }

    const GOOGLE_API_KEY = Deno.env.get("GOOGLE_PLACES_API_KEY");

    if (!apiKey) {
      return new Response(
        JSON.stringify({ error: "Missing GOOGLE_MAPS_API_KEY" }),
        { status: 500 }
      );
    }

    const url = `https://maps.googleapis.com/maps/api/place/photo?maxwidth=800&photoreference=${photo_reference}&key=${apiKey}`;

    const googleRes = await fetch(url);

    if (!googleRes.ok) {
      return new Response(
        JSON.stringify({ error: "Google API error", status: googleRes.status }),
        { status: 500 }
      );
    }

    const arrayBuffer = await googleRes.arrayBuffer();

    return new Response(arrayBuffer, {
      status: 200,
      headers: {
        "Content-Type": googleRes.headers.get("Content-Type") || "image/jpeg",
        "Cache-Control": "public, max-age=86400"
      },
    });

  } catch (err) {
    return new Response(
      JSON.stringify({ error: err.message }),
      { status: 500 }
    );
  }

});
