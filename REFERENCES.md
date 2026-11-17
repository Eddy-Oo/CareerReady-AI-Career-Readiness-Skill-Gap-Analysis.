# References

The following references document the main frameworks, libraries, database technologies, and AI service used in the CareerReady AI project. The list is formatted consistently in APA 7th-edition style. Entries for technologies not used in the submitted version should be removed.

1. FastAPI. (n.d.). *FastAPI documentation*. https://fastapi.tiangolo.com/

2. Google. (n.d.). *Gemini API documentation*. Google AI for Developers. https://ai.google.dev/gemini-api/docs

3. Joblib developers. (n.d.). *Joblib documentation*. https://joblib.readthedocs.io/

4. Neon. (n.d.). *Neon documentation*. https://neon.com/docs

5. pandas development team. (n.d.). *pandas documentation*. https://pandas.pydata.org/docs/

6. PostgreSQL Global Development Group. (n.d.). *PostgreSQL documentation*. https://www.postgresql.org/docs/

7. React. (n.d.). *React documentation*. https://react.dev/

8. scikit-learn developers. (n.d.). *LogisticRegression*. scikit-learn documentation. https://scikit-learn.org/stable/modules/generated/sklearn.linear_model.LogisticRegression.html

9. scikit-learn developers. (n.d.). *TfidfVectorizer*. scikit-learn documentation. https://scikit-learn.org/stable/modules/generated/sklearn.feature_extraction.text.TfidfVectorizer.html

10. spaCy. (n.d.). *PhraseMatcher*. spaCy API documentation. https://spacy.io/api/phrasematcher

11. SQLAlchemy authors. (n.d.). *SQLAlchemy documentation*. https://docs.sqlalchemy.org/

12. Microsoft. (n.d.). *TypeScript documentation*. https://www.typescriptlang.org/docs/

13. Vite. (n.d.). *Vite documentation*. https://vite.dev/guide/

14. Mozilla. (n.d.). *PDF.js*. https://mozilla.github.io/pdf.js/

15. CareerReady AI. (2026). *CareerReady AI: AI-powered career readiness and skill gap analysis system* [Source code]. GitHub. https://github.com/Eddy-Oo/CareerReady-AI-Career-Readiness-Skill-Gap-Analysis.

## Notes for the final report

- Keep the Google Gemini reference because the backend uses the Gemini API for generative career advice.
- Remove the OpenAI reference because the submitted backend uses Google Gemini, not the OpenAI API.
- The spaCy reference is narrowed to PhraseMatcher because the backend uses spaCy's blank English pipeline and PhraseMatcher for skill extraction; it does not use a downloaded spaCy language model.
- The two scikit-learn references are relevant to the trained TF-IDF and Logistic Regression career-role prediction pipeline.
- The CareerReady AI source-code reference uses the repository's actual name, including its final period. The APA URL does not need the `.git` suffix.
- Do not include a reference merely because a package is installed. Keep an entry only if the technology is actually used or discussed in the final submitted project/report.
