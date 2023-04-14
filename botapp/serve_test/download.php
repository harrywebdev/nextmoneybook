<?php

$filePath = "./Pohyby_0488226002_202202281231.csv";
$content = file_get_contents($filePath);

header("Content-Disposition: attachment; filename=\"test.csv\"");
header("Content-Type: text/csv; charset=UTF-8");
header("Content-Length: " . filesize($filePath));
header('Content-Transfer-Encoding: binary');
header("Connection: close");

echo $content;