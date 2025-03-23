using Microsoft.OpenApi.Models;
using To_Do_List_Project.Properties;
using To_Do_List_Project.Services;

var builder = WebApplication.CreateBuilder(args);

builder.Services.AddAuthorization();
builder.Services.AddControllers();
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen(c =>
{
    c.SwaggerDoc("v1", new OpenApiInfo { Title = "ToDo API", Version = "v1" });
    c.OperationFilter<AuthHeaderOperationFilter>();
});

builder.Services.AddScoped<UserService>();
builder.Services.AddScoped<AuthService>();

if (builder.Environment.IsProduction())
{
    builder.WebHost.ConfigureKestrel(serverOptions =>
    {
        serverOptions.ListenAnyIP(7254);
        serverOptions.ListenAnyIP(7255, listenOptions =>
        {
            listenOptions.UseHttps("/etc/letsencrypt/live/lets-digit.ru/certificate.pfx", "12345");
        });
    });
}
else if (builder.Environment.IsDevelopment())
{
    builder.WebHost.UseUrls("https://localhost:7254");
}

builder.Services.AddCors(options =>
{
    options.AddPolicy("AllowSpecificOrigin",
        builder =>
        {
            builder.WithOrigins("http://localhost:3000", "https://localhost:3000", "https://lets-digit.ru")
                   .AllowAnyHeader()
                   .AllowAnyMethod();
        });
});

var app = builder.Build();

if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI();
}

app.UseHttpsRedirection();

app.UseCors("AllowSpecificOrigin");

app.UseAuthentication();
app.UseAuthorization();

app.MapControllers();

app.Run();