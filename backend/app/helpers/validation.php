<?php
declare(strict_types=1);

final class Validator
{
    public array $errors = [];
    public array $data;

    public function __construct(array $data) { $this->data = $data; }

    public function required(string $field, string $label = null): self {
        if (trim((string)($this->data[$field] ?? '')) === '') {
            $this->errors[$field] = ($label ?: $field) . ' is required.';
        }
        return $this;
    }
    public function email(string $field): self {
        $v = (string)($this->data[$field] ?? '');
        if ($v !== '' && !filter_var($v, FILTER_VALIDATE_EMAIL)) {
            $this->errors[$field] = 'Invalid email address.';
        }
        return $this;
    }
    public function min(string $field, int $n): self {
        if (strlen((string)($this->data[$field] ?? '')) < $n) {
            $this->errors[$field] = "Must be at least $n characters.";
        }
        return $this;
    }
    public function max(string $field, int $n): self {
        if (strlen((string)($this->data[$field] ?? '')) > $n) {
            $this->errors[$field] = "Must be at most $n characters.";
        }
        return $this;
    }
    public function in(string $field, array $allowed): self {
        if (!in_array($this->data[$field] ?? null, $allowed, true)) {
            $this->errors[$field] = 'Invalid value.';
        }
        return $this;
    }
    public function passes(): bool { return empty($this->errors); }
}
