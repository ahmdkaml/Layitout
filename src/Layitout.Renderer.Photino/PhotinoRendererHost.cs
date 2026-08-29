using Layitout.Core;
using Photino.NET;

namespace Layitout.Renderer.Photino;

public sealed class PhotinoRendererHost : IRendererHost
{
    private PhotinoWindow? _window;
    private string _title = "Layitout";
    private int _width = 1280;
    private int _height = 800;
    private string _initialHtml = "<html><body><h1>Loading Layitout...</h1></body></html>";

    public void Initialize(string title, int width = 1200, int height = 800)
    {
        _title = title;
        _width = width;
        _height = height;
    }

    public void LoadHtml(string html, string? baseUrl = null)
    {
        _initialHtml = html;
        if (_window != null)
        {
            _window.LoadRawString(html);
        }
    }

    public void LoadFile(string path)
    {
        var html = File.ReadAllText(path);
        LoadHtml(html);
    }

    public Task ExecuteRawScriptAsync(string script, CancellationToken ct = default)
    {
        _window?.SendWebMessage(script);
        return Task.CompletedTask;
    }

    public void Run()
    {
        // Build window and start message loop with initial HTML preloaded
        _window = new PhotinoWindow()
            .SetTitle(_title)
            .SetSize(_width, _height)
            .SetUseOsDefaultSize(false)
            .Center()
            .LoadRawString(_initialHtml);

        _window.WaitForClose();
    }

    public ValueTask DisposeAsync()
    {
        _window?.Close();
        return ValueTask.CompletedTask;
    }
}
