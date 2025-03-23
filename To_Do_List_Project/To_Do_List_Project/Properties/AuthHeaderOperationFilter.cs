namespace To_Do_List_Project.Properties
{
    using Microsoft.OpenApi.Models;
    using Swashbuckle.AspNetCore.SwaggerGen;
    using System.Collections.Generic;

    public class AuthHeaderOperationFilter : IOperationFilter
    {
        public void Apply(OpenApiOperation operation, OperationFilterContext context)
        {
            if (operation.Parameters == null)
                operation.Parameters = new List<OpenApiParameter>();

            operation.Parameters.Add(new OpenApiParameter
            {
                Name = "Auth",
                In = ParameterLocation.Header,
                Description = "Authorization token",
                Required = false,
                Schema = new OpenApiSchema
                {
                    Type = "string"
                }
            });
        }
    }
}