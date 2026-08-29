using System.Text.Json;
using Layitout.Renderer.Photino;

namespace Layitout.Host;

internal static class Program
{
    [STAThread]
    private static void Main(string[] args)
    {
        try
        {
            var baseDir = AppContext.BaseDirectory;

            // Resolve file paths
            var shellHtmlPath = Path.Combine(baseDir, "Shell", "app.html");
            var shellCssPath = Path.Combine(baseDir, "Shell", "app.css");
            var shellJsPath = Path.Combine(baseDir, "Shell", "app.js");
            var sampleHtmlPath = Path.Combine(baseDir, "Samples", "sample.html");
            var sampleCssPath = Path.Combine(baseDir, "Samples", "sample.css");

            // Read contents with fallback defaults if files are not yet copied
            var shellHtml = File.Exists(shellHtmlPath) ? File.ReadAllText(shellHtmlPath) : "<h1>Shell not found</h1>";
            var shellCss = File.Exists(shellCssPath) ? File.ReadAllText(shellCssPath) : "";
            var shellJs = File.Exists(shellJsPath) ? File.ReadAllText(shellJsPath) : "";
            var sampleHtml = File.Exists(sampleHtmlPath) ? File.ReadAllText(sampleHtmlPath) : "<h2>Sample App</h2>";
            var sampleCss = File.Exists(sampleCssPath) ? File.ReadAllText(sampleCssPath) : "";

            // Prepare embedded user preview payload inside JS
            var escapedSampleHtml = JsonSerializer.Serialize(sampleHtml);
            var escapedSampleCss = JsonSerializer.Serialize(sampleCss);

            var previewAutoLoader = $@"
                window.addEventListener('DOMContentLoaded', () => {{
                    if (window.loadUserPreview) {{
                        window.loadUserPreview({escapedSampleHtml}, {escapedSampleCss});
                    }}
                }});
            ";

            var assembledShell = shellHtml
                .Replace("<link rel=\"stylesheet\" href=\"app.css\" />", $"<style>{shellCss}</style>")
                .Replace("<script src=\"app.js\"></script>", $"<script>{shellJs}\n{previewAutoLoader}</script>");

            var renderer = new PhotinoRendererHost();
            renderer.Initialize("Layitout - Desktop Studio", width: 1280, height: 800);
            renderer.LoadHtml(assembledShell);
            renderer.Run();
        }
        catch (Exception ex)
        {
            Console.WriteLine($"Fatal Startup Error: {ex}");
            Console.ReadLine();
        }
    }
}
