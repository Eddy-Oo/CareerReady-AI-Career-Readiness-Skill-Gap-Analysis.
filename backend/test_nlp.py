from app.main import extract_resume

sample_resume = """
Tin Aung Oo
Software Developer

Education:
Bachelor of Computer Science

Skills:
Python, JavaScript, React, Node.js, SQL, PostgreSQL,
Machine Learning, NLP, REST APIs, Docker, Git.

Experience:
Worked as a Software Developer Intern.

Projects:
Developed a career analysis web application using Python and React.

Soft Skills:
Communication, Problem Solving, Teamwork.
"""

result = extract_resume(sample_resume, "test_resume.txt")

print("\n========== NLP TEST RESULTS ==========")

print("\nExtracted Skills:")
for skill in result["extractedSkills"]:
    print(
        skill["name"],
        "|",
        skill["category"],
        "| Confidence:",
        skill["confidence"]
    )

print("\nTechnical Skills:", len(result["technicalSkills"]))
print("Soft Skills:", len(result["softSkills"]))
print("Education:", result["education"])
print("Experience:", result["experiences"])
print("Projects:", result["projects"])