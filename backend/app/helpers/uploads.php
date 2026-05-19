<?php
declare(strict_types=1);

function handle_upload(string $field): ?string {
    if (empty($_FILES[$field]) || $_FILES[$field]['error'] === UPLOAD_ERR_NO_FILE) return null;
    $f = $_FILES[$field];
    if ($f['error'] !== UPLOAD_ERR_OK) throw new RuntimeException('Upload failed.');
    if ($f['size'] > MAX_UPLOAD_BYTES) throw new RuntimeException('File too large.');
    $mime = (new finfo(FILEINFO_MIME_TYPE))->file($f['tmp_name']) ?: '';
    if (!in_array($mime, ALLOWED_UPLOAD_MIME, true)) throw new RuntimeException('File type not allowed.');

    if (!is_dir(UPLOAD_PATH)) mkdir(UPLOAD_PATH, 0775, true);
    $ext = pathinfo($f['name'], PATHINFO_EXTENSION);
    $name = bin2hex(random_bytes(8)) . ($ext ? '.' . preg_replace('/[^a-z0-9]/i', '', $ext) : '');
    $dest = UPLOAD_PATH . '/' . $name;
    if (!move_uploaded_file($f['tmp_name'], $dest)) throw new RuntimeException('Could not save file.');
    return '/uploads/' . $name;
}
