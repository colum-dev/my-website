const JSON_HEADERS = {
  "Content-Type": "application/json; charset=utf-8",
  "Cache-Control": "no-store"
};

function json(data, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: JSON_HEADERS
  });
}

function clean(value, maxLength) {
  return typeof value === "string"
    ? value.trim().slice(0, maxLength)
    : "";
}

export async function onRequestPost({ request, env }) {
  if (!request.headers.get("content-type")?.includes("application/json")) {
    return json({ success: false, message: "فرمت درخواست معتبر نیست." }, 415);
  }

  const contentLength = Number(request.headers.get("content-length") || 0);
  if (contentLength > 12_000) {
    return json({ success: false, message: "حجم اطلاعات ارسالی بیش از حد مجاز است." }, 413);
  }

  let body;
  try {
    body = await request.json();
  } catch {
    return json({ success: false, message: "اطلاعات ارسالی معتبر نیست." }, 400);
  }

  // Honeypot: bots often fill hidden fields. Return a generic success response.
  if (clean(body.website, 200)) {
    return json({ success: true, message: "درخواست ثبت شد." });
  }

  const name = clean(body.name, 100);
  const appUrl = clean(body.appUrl, 500);
  const contact = clean(body.contact, 120);
  const need = clean(body.need, 1000);

  if (!name || !contact || !need) {
    return json({
      success: false,
      message: "نام، راه ارتباطی و نوع نیاز الزامی هستند."
    }, 400);
  }

  if (appUrl) {
    try {
      const parsedUrl = new URL(appUrl);
      if (!["http:", "https:"].includes(parsedUrl.protocol)) throw new Error();
    } catch {
      return json({ success: false, message: "لینک اپ یا سایت معتبر نیست." }, 400);
    }
  }

  if (!env.DB) {
    return json({
      success: false,
      message: "سرویس ذخیره‌سازی هنوز پیکربندی نشده است."
    }, 503);
  }

  try {
    await env.DB.prepare(`
      INSERT INTO contact_requests (name, app_url, contact, need)
      VALUES (?, ?, ?, ?)
    `).bind(name, appUrl || null, contact, need).run();

    return json({
      success: true,
      message: "درخواستت با موفقیت ثبت شد."
    }, 201);
  } catch (error) {
    console.error("Contact request insert failed:", error);
    return json({
      success: false,
      message: "ثبت درخواست در حال حاضر امکان‌پذیر نیست."
    }, 500);
  }
}

export async function onRequestGet() {
  return json({ success: false, message: "Method not allowed." }, 405);
}
