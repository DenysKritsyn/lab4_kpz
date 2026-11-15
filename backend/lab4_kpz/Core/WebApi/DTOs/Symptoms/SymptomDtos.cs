using lab4_kpz.Core.WebApi.DTOs.Common;

namespace lab4_kpz.Core.WebApi.DTOs.Symptoms;

public sealed record SymptomResponseDto(
    int SymptomId,
    string SymptomName);

public sealed record CreateSymptomDto(
    string SymptomName);

public sealed record UpdateSymptomDto(
    string SymptomName);

public sealed class SymptomQueryDto : PaginationQueryDto
{
    public string? Search { get; set; }
}

