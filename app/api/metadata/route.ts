import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const { url } = await req.json();
    if (!/^https?:\/\//i.test(url)) return NextResponse.json({error:"Invalid URL"}, {status:400});
    const response = await fetch(url, {
      headers: {"User-Agent":"Mozilla/5.0 (compatible; LinkVault/1.0)"},
      redirect:"follow", signal:AbortSignal.timeout(8000)
    });
    const html = await response.text();
    const pick = (property:string) => {
      const r = new RegExp(`<meta[^>]+(?:property|name)=["']${property}["'][^>]+content=["']([^"']+)["']`, "i");
      const r2 = new RegExp(`<meta[^>]+content=["']([^"']+)["'][^>]+(?:property|name)=["']${property}["']`, "i");
      return (html.match(r)?.[1] || html.match(r2)?.[1] || "").replace(/&amp;/g,"&");
    };
    const title = pick("og:title") || (html.match(/<title[^>]*>(.*?)<\/title>/i)?.[1] || "").replace(/<[^>]+>/g,"").trim();
    const description = pick("og:description") || pick("description");
    const domain = new URL(url).hostname.replace(/^www\./,"");
    return NextResponse.json({title, description, domain});
  } catch {
    try { return NextResponse.json({title:"",description:"",domain:new URL((await req.clone().json()).url).hostname.replace(/^www\./,"")}); }
    catch { return NextResponse.json({title:"",description:"",domain:""}); }
  }
}