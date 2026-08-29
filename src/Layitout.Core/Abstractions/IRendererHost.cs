namespace Layitout.Core;

public interface IRendererHost : IAsyncDisposable
{
    void Initialize(string title, int width = 1200, int height = 800);
    void LoadHtml(string html, string? baseUrl = null);
    void LoadFile(string relativeOrAbsolutePath);
    Task ExecuteRawScriptAsync(string script, CancellationToken ct = default);
    void Run();
}
