<?php
if(isset($_POST['submit'])) {
    $path = $_POST['path'];
    $command = escapeshellcmd("finaldummy.py");
    $output = shell_exec($command);
    echo "<pre>$output</pre>";
}
?>
