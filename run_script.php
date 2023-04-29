<?php
if(isset($_POST['submit'])) {
    $path = $_POST['path'];
    $command = escapeshellcmd("pythonfiledummy.py");
    $output = shell_exec($command);
    echo "<pre>$output</pre>";
}
?>
