using Microsoft.AspNetCore.ResponseCompression;

var builder = WebApplication.CreateBuilder(args);

// Brotli and gzip for text assets keep the first load small.
builder.Services.AddResponseCompression(options =>
{
    options.EnableForHttps = true;
    options.MimeTypes = ResponseCompressionDefaults.MimeTypes.Concat(new[] { "application/manifest+json" });
});

var app = builder.Build();

if (!app.Environment.IsDevelopment())
{
    // Browsers that visit once over HTTPS will keep using HTTPS.
    app.UseHsts();
}

app.UseResponseCompression();

// Security headers. The demo loads nothing from other sites, so the policy can stay strict.
app.Use(async (context, next) =>
{
    var headers = context.Response.Headers;
    headers["Content-Security-Policy"] = string.Join("; ", new[]
    {
        "default-src 'self'",
        "script-src 'self'",
        "style-src 'self'",
        "img-src 'self' data:",
        "font-src 'self'",
        "connect-src 'self'",
        "manifest-src 'self'",
        "object-src 'none'",
        "base-uri 'self'",
        "form-action 'self'",
        "frame-ancestors 'none'",
        "require-trusted-types-for 'script'"
    });
    headers["X-Content-Type-Options"] = "nosniff";
    headers["Referrer-Policy"] = "strict-origin-when-cross-origin";
    headers["Permissions-Policy"] = "camera=(), microphone=(), geolocation=()";
    headers["Cross-Origin-Opener-Policy"] = "same-origin";

    await next();
});

app.UseDefaultFiles();
app.UseStaticFiles(new StaticFileOptions
{
    OnPrepareResponse = context =>
    {
        // CSS, JS and fonts are referenced with a ?v= value in index.html, so a year of
        // caching is safe. Bump that value whenever one of those files changes.
        var path = context.Context.Request.Path;
        var longLived = path.StartsWithSegments("/css")
            || path.StartsWithSegments("/js")
            || path.StartsWithSegments("/fonts");

        context.Context.Response.Headers.CacheControl = longLived
            ? "public, max-age=31536000, immutable"
            : context.File.Name.EndsWith(".html", StringComparison.OrdinalIgnoreCase)
                ? "no-cache"
                : "public, max-age=86400";
    }
});

// A short, plain summary of the site for AI agents and crawlers (see https://llmstxt.org).
// It is built per request so the links always match the address the site is served from.
app.MapGet("/llms.txt", (HttpContext context) =>
{
    var origin = $"{context.Request.Scheme}://{context.Request.Host}";
    var lines = new[]
    {
        "# Leadwise CRM",
        "",
        "> Leadwise CRM is a frontend demo of a customer relationship dashboard. It shows sample lead stats, a pipeline chart, lead sources and a searchable lead table. All data is placeholder content and nothing is saved.",
        "",
        "## Pages",
        "",
        $"- [Dashboard]({origin}/): The one page in the demo, with summary stats, charts and the lead table",
        "",
        "## Optional",
        "",
        $"- [robots.txt]({origin}/robots.txt): Crawler rules for this site",
        $"- [Web app manifest]({origin}/site.webmanifest): Install details and icons"
    };

    return Results.Text(string.Join("\n", lines) + "\n", "text/plain; charset=utf-8");
});

app.Run();
