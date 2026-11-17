# References

The following references support the design and study of CareerReady AI. They include academic research related to machine learning, text processing, resume and job matching, and the technologies used in the project. The academic papers are useful background sources; they do not mean that every method described in those papers is implemented in this project.

## Academic articles and research papers

Cox, D. R. (1958). *The regression analysis of binary sequences*. Journal of the Royal Statistical Society: Series B (Methodological), 20(2), 215–232.

https://doi.org/10.1111/j.2517-6161.1958.tb00292.x

Devlin, J., Chang, M.-W., Lee, K., & Toutanova, K. (2019). *BERT: Pre-training of deep bidirectional transformers for language understanding*. Proceedings of the 2019 Conference of the North American Chapter of the Association for Computational Linguistics: Human Language Technologies, 1, 4171–4186.

https://doi.org/10.18653/v1/N19-1423

Gugnani, A., & Misra, H. (2020). *Implicit skills extraction using document embedding and its use in job recommendation*. Proceedings of the AAAI Conference on Artificial Intelligence, 34(08), 13286–13293.

https://doi.org/10.1609/aaai.v34i08.7038

Salton, G., & Buckley, C. (1988). *Term-weighting approaches in automatic text retrieval*. Information Processing & Management, 24(5), 513–523.

https://doi.org/10.1016/0306-4573(88)90021-0

Vaswani, A., Shazeer, N., Parmar, N., Uszkoreit, J., Jones, L., Gomez, A. N., Kaiser, Ł., & Polosukhin, I. (2017). *Attention is all you need*. Advances in Neural Information Processing Systems, 30.

https://proceedings.neurips.cc/paper/2017/hash/3f5ee243547dee91fbd053c1c4a845aa-Abstract.html

## Technical documentation and tools used

FastAPI. (n.d.). *FastAPI documentation*. https://fastapi.tiangolo.com/

Google. (n.d.). *Gemini API documentation*. Google AI for Developers. https://ai.google.dev/gemini-api/docs

Joblib developers. (n.d.). *Joblib documentation*. https://joblib.readthedocs.io/

Neon. (n.d.). *Neon documentation*. https://neon.com/docs

pandas development team. (n.d.). *pandas documentation*. https://pandas.pydata.org/docs/

PostgreSQL Global Development Group. (n.d.). *PostgreSQL documentation*. https://www.postgresql.org/docs/

React. (n.d.). *React documentation*. https://react.dev/

scikit-learn developers. (n.d.). *LogisticRegression*. scikit-learn documentation. https://scikit-learn.org/stable/modules/generated/sklearn.linear_model.LogisticRegression.html

scikit-learn developers. (n.d.). *TfidfVectorizer*. scikit-learn documentation. https://scikit-learn.org/stable/modules/generated/sklearn.feature_extraction.text.TfidfVectorizer.html

spaCy. (n.d.). *PhraseMatcher*. spaCy API documentation. https://spacy.io/api/phrasematcher

SQLAlchemy authors. (n.d.). *SQLAlchemy documentation*. https://docs.sqlalchemy.org/

Microsoft. (n.d.). *TypeScript documentation*. https://www.typescriptlang.org/docs/

Vite. (n.d.). *Vite documentation*. https://vite.dev/guide/

Mozilla. (n.d.). *PDF.js*. https://mozilla.github.io/pdf.js/

CareerReady AI. (2026). *CareerReady AI: AI-powered career readiness and skill gap analysis system* [Source code]. GitHub. https://github.com/Eddy-Oo/CareerReady-AI-Career-Readiness-Skill-Gap-Analysis.

## How the academic papers relate to this project

- Cox (1958) provides foundational background for logistic regression, the type of classifier used for career-role prediction.
- Salton and Buckley (1988) explain term-weighting methods that underpin TF-IDF-style text representation.
- Gugnani and Misra (2020) is directly relevant to extracting skills from resumes and matching them with job requirements.
- Vaswani et al. (2017) introduces the Transformer architecture, which is foundational to many modern language models.
- Devlin et al. (2019) introduces BERT, a Transformer-based language representation model. It is useful background for understanding modern NLP, but this project does not claim to implement BERT.

## Notes for the final report

- Keep the Google Gemini reference because the backend uses the Gemini API for generative career advice.
- Do not cite OpenAI as the project's AI provider; the submitted backend uses Google Gemini.
- The spaCy reference is specific to PhraseMatcher because the backend uses spaCy's blank English pipeline and PhraseMatcher for skill extraction.
- The scikit-learn references relate to the trained TF-IDF and Logistic Regression career-role prediction pipeline.
- Include only references that are relevant to the submitted implementation or that you actually discuss in the report. The academic papers above can support the literature review and explain the foundations of the methods.
