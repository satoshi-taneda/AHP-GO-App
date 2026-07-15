import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  const keyword = request.nextUrl.searchParams.get("keyword");

  if (!keyword) {
    return NextResponse.json(
      { message: "keywordが指定されていません" },
      { status: 400 }
    );
  }
  const appId = process.env.RAKUTEN_APP_ID;
  const accessKey = process.env.RAKUTEN_ACCESS_KEY;

//   console.log({
//     appId: appId,
//     accessKey: accessKey
//   })

  if (!appId || !accessKey) {
    return NextResponse.json(
        { message: "楽天APIの環境変数が設定されていません" },
        { status: 500 }
    );
  }

  const url =
    `https://openapi.rakuten.co.jp/ichibams/api/IchibaItem/Search/20260701` +
    `?applicationId=${appId}` +
    `&accessKey=${accessKey}` +
    `&keyword=${encodeURIComponent(keyword)}` +
    `&sort=standard` +
    `&hits=30`;

  try {
    const res = await fetch(url, {
      headers: {
        Referer: "https://ahp-go-app.vercel.app",
        Orign: "https://ahp-go-app.vercel.app",
      },
    });

    if (!res.ok) {
      const error = await res.text();

      console.error("楽天APIエラー", error);

      return NextResponse.json(
        { error },
        { status: res.status }
      );
    }

    const data = await res.json();
    const items = data.Items.map((item: any) => ({
      name: item.Item.itemName,
      image: item.Item.mediumImageUrls[0]?.imageUrl
        ? item.Item.mediumImageUrls[0]?.imageUrl.replace("/^http:/", "https:")
        : "/no-image.png",
      url: item.Item.itemUrl,
      price: item.Item.itemPrice,
    }))

    return NextResponse.json(items);
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { message: "サーバーエラーが発生しました" },
      { status: 500 }
    );
  }
}
