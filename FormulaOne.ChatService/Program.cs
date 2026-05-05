using FormulaOne.ChatService.DataService;
using FormulaOne.ChatService.Hubs;
using FormulaOne.ChatService.Repositories;

var builder = WebApplication.CreateBuilder(args);

// Add services to the container.
builder.Services.AddSignalR();
builder.Services.AddControllers();
// Learn more about configuring Swagger/OpenAPI at https://aka.ms/aspnetcore/swashbuckle
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen();
builder.Services.AddCors(options =>
{
    options.AddPolicy("CorsPolicy", builder => builder.WithOrigins("http://localhost:3000")
    .AllowAnyMethod()
    .AllowAnyHeader()
    .AllowCredentials()
    );
});

// Register Repository Pattern - abstraction for data access
builder.Services.AddSingleton<IUserConnectionRepository, InMemoryUserConnectionRepository>();

// Keep SharedDb for backward compatibility (optional - can be removed later)
builder.Services.AddSingleton<SharedDb>();

var app = builder.Build();

// Configure the HTTP request pipeline.
if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI();
}

app.UseHttpsRedirection();
app.UseCors("CorsPolicy");
app.UseAuthorization();
// الجزء الرابع: Mapping (توجيه الريكوستات)
app.MapControllers();
app.MapHub<ChatHub>("/chatHub");

// الجزء الأخير: تشغيل التطبيق
app.Run();
