import re

files = [
    "/home/octave/Bureau/hack/frontend/src/pages/ChatPage.jsx",
    "/home/octave/Bureau/hack/frontend/src/components/student/StudentSessions.jsx"
]

for file_path in files:
    with open(file_path, "r") as f:
        content = f.read()
    
    # Simple regex to replace blue-XXX with emerald-XXX
    new_content = re.sub(r"blue-([0-9]+)", r"emerald-\1", content)

    # Some blue utility classes don't match the digit pattern like 'blue', 'text-blue', let's check.
    # We mainly use things like bg-blue-500, border-blue-200.
    # What about text-blue-500? That matches r"blue-([0-9]+)".
    # What about bg-blue-50/80? That matches "blue-50".
    
    with open(file_path, "w") as f:
        f.write(new_content)

print("Completed color replacement.")
