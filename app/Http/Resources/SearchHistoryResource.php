<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class SearchHistoryResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'search_text' => $this->search_text,
            'filters' => $this->filters ?? [],
            'result_count' => $this->result_count,
            'search_count' => $this->search_count,
            'last_searched_at' => $this->last_searched_at,
            'created_at' => $this->created_at,
            'preview_property' => $this->preview_property
                ? new PropertyResource($this->preview_property)
                : null,
        ];
    }
}
