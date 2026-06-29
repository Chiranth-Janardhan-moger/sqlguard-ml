import subprocess

def test_cli_detect():
    result = subprocess.run(["sqlguard", "detect", "' OR 1=1"], capture_output=True, text=True)
    assert result.returncode == 0
    assert "label" in result.stdout
