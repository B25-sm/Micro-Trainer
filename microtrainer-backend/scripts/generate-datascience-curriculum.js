/**
 * Generates data/curriculums/datascience.json from the official DS syllabus.
 * Run: node scripts/generate-datascience-curriculum.js
 */
const fs = require("fs");
const path = require("path");

const SECTIONS = [
  {
    id: "01",
    title: "Foundation & Data Literacy",
    modules: [
      {
        title: "Data Science Landscape & Career Paths",
        topics: [
          "What is Data Science? Real-world impact and applications",
          "Career Paths: Data Scientist vs Data Analyst vs ML Engineer vs Data Engineer",
          "Industry Applications: Healthcare, Finance, E-commerce, Sports, Social Media",
          "Success Stories: Case studies of data-driven decisions",
          "Setting Expectations: Salary ranges, skill requirements, job market",
        ],
        project: null,
      },
      {
        title: "Data Fundamentals & Ethics",
        topics: [
          "Types of Data: Structured vs Unstructured, Quantitative vs Qualitative",
          "Data Collection Methods: Surveys, APIs, Web scraping, Sensors",
          "Data Quality: Accuracy, Completeness, Consistency, Timeliness",
          "Data Ethics & Privacy: GDPR basics, Algorithmic bias, Responsible AI",
          "Data Lifecycle: Collection → Storage → Processing → Analysis → Insights",
        ],
        project: null,
      },
      {
        title: "Excel/Google Sheets Mastery",
        topics: [
          "Core Functions: VLOOKUP, INDEX-MATCH, Conditional formatting",
          "Pivot Tables & Charts: Dynamic reporting and visualization",
          "Data Cleaning: Remove duplicates, handle errors, text-to-columns",
          "Statistical Functions: AVERAGE, MEDIAN, STDEV, CORREL",
        ],
        project: "Create a sales performance dashboard",
      },
    ],
  },
  {
    id: "02",
    title: "Python Programming & Data Tools",
    modules: [
      {
        title: "Python Programming Fundamentals",
        topics: [
          "Environment Setup: Anaconda, Jupyter Notebooks, VS Code",
          "Python Basics: Variables, data types, operators, input/output",
          "Control Structures: Conditions, loops, nested logic",
          "Functions: Definition, parameters, return values, scope",
          "Data Structures: Lists, tuples, dictionaries, sets",
          "File Handling: Reading/writing CSV, TXT, JSON files",
          "Error Handling: Try-except blocks, debugging techniques",
        ],
        project: "Build a student grade management system",
      },
      {
        title: "Data Manipulation with Pandas",
        topics: [
          "Series & DataFrames: Creation, indexing, slicing",
          "Data Loading: CSV, Excel, JSON, SQL databases",
          "Data Exploration: head(), info(), describe(), shape",
          "Data Cleaning: Handle missing values, duplicates, data types",
          "Data Transformation: Filtering, sorting, groupby, pivot tables",
          "String Operations: Text cleaning, regex basics",
          "Date/Time Handling: Parsing dates, time series basics",
        ],
        project: "Clean and analyze a messy real-world dataset",
      },
      {
        title: "Numerical Computing with NumPy",
        topics: [
          "Array Operations: Creation, indexing, slicing, reshaping",
          "Mathematical Functions: Statistics, linear algebra basics",
          "Broadcasting: Efficient array operations",
          "Integration with Pandas: When to use NumPy vs Pandas",
        ],
        project: "Financial portfolio analysis with stock data",
      },
    ],
  },
  {
    id: "03",
    title: "Data Analysis & Visualization",
    modules: [
      {
        title: "Exploratory Data Analysis (EDA)",
        topics: [
          "Statistical Measures: Mean, median, mode, variance, standard deviation",
          "Distribution Analysis: Histograms, box plots, skewness, kurtosis",
          "Correlation Analysis: Pearson, Spearman correlation",
          "Outlier Detection: IQR method, Z-score, visualization techniques",
          "Data Profiling: Automated EDA tools (pandas-profiling)",
        ],
        project: "Complete EDA on Titanic/House prices dataset",
      },
      {
        title: "Data Visualization Mastery",
        topics: [
          "Matplotlib Fundamentals: Plots, subplots, customization",
          "Seaborn for Statistical Plots: Heatmaps, pair plots, regression plots",
          "Plotly for Interactive Visualizations: Dynamic charts, dashboards",
          "Chart Selection: When to use bar, line, scatter, histogram, etc.",
          "Storytelling with Data: Design principles, color theory, annotations",
          "Advanced Visualizations: Geographic plots, network graphs",
        ],
        project: "Create an interactive dashboard for COVID-19 data",
      },
      {
        title: "Statistics for Data Science",
        topics: [
          "Descriptive Statistics: Measures of central tendency and spread",
          "Probability Fundamentals: Basic probability, conditional probability",
          "Probability Distributions: Normal, binomial, Poisson",
          "Sampling & Sampling Distributions: Central limit theorem",
          "Confidence Intervals: Interpretation and calculation",
          "Hypothesis Testing: t-tests, chi-square tests, ANOVA",
          "A/B Testing: Design, execution, interpretation",
        ],
        project: "Design and analyze an A/B test for an e-commerce website",
      },
    ],
  },
  {
    id: "04",
    title: "Database & SQL Skills",
    modules: [
      {
        title: "SQL for Data Analysis",
        topics: [
          "Database Fundamentals: Tables, relationships, normalization",
          "Basic Queries: SELECT, WHERE, ORDER BY, LIMIT",
          "Aggregation: GROUP BY, HAVING, COUNT, SUM, AVG",
          "Joins: INNER, LEFT, RIGHT, FULL OUTER joins",
          "Subqueries: Nested queries, correlated subqueries",
          "Window Functions: ROW_NUMBER, RANK, LAG, LEAD",
          "Date Functions: Date arithmetic, formatting, extraction",
          "Python Integration: SQLite, pandas.read_sql()",
        ],
        project: "Analyze sales data from multiple tables with complex queries",
      },
      {
        title: "Database Design & Advanced SQL",
        topics: [
          "Data Modeling: ER diagrams, primary/foreign keys",
          "Performance Optimization: Indexes, query optimization",
          "Data Warehousing Concepts: OLTP vs OLAP, ETL basics",
          "NoSQL Basics: When to use MongoDB, document databases",
        ],
        project: "Design and implement a database for a library management system",
      },
    ],
  },
  {
    id: "05",
    title: "Machine Learning Fundamentals",
    modules: [
      {
        title: "ML Foundations & Problem Framing",
        topics: [
          "What is Machine Learning? Types of learning, real-world applications",
          "Problem Types: Regression, classification, clustering, recommendation",
          "ML Workflow: Problem definition → Data → Model → Evaluation → Deployment",
          "Data Preparation: Feature engineering, scaling, encoding",
          "Train-Test Split: Validation strategies, cross-validation",
          "Overfitting vs Underfitting: Bias-variance tradeoff",
          "Model Evaluation Metrics: Accuracy, precision, recall, F1-score, ROC-AUC",
        ],
        project: null,
      },
      {
        title: "Supervised Learning - Regression",
        topics: [
          "Linear Regression: Simple and multiple regression",
          "Polynomial Regression: Non-linear relationships",
          "Regularization: Ridge, Lasso, Elastic Net",
          "Model Evaluation: R², MAE, MSE, RMSE",
          "Feature Selection: Correlation, statistical tests, recursive elimination",
        ],
        project: "Predict house prices with comprehensive feature engineering",
      },
      {
        title: "Supervised Learning - Classification",
        topics: [
          "Logistic Regression: Binary and multiclass classification",
          "Decision Trees: Splitting criteria, pruning, interpretation",
          "k-Nearest Neighbors (k-NN): Distance metrics, choosing k",
          "Naive Bayes: Gaussian, multinomial, Bernoulli",
          "Support Vector Machines: Linear and non-linear kernels",
          "Model Evaluation: Confusion matrix, classification report",
          "Handling Imbalanced Data: SMOTE, class weights, sampling techniques",
        ],
        project: "Build a customer churn prediction model",
      },
      {
        title: "Ensemble Methods & Model Optimization",
        topics: [
          "Bagging: Random Forest, Extra Trees",
          "Boosting: AdaBoost, Gradient Boosting, XGBoost, LightGBM",
          "Stacking: Meta-learning approaches",
          "Hyperparameter Tuning: Grid search, random search, Bayesian optimization",
          "Feature Importance: Tree-based importance, permutation importance",
          "Model Selection: Comparing multiple algorithms",
        ],
        project: "Kaggle-style competition with ensemble methods",
      },
      {
        title: "Unsupervised Learning",
        topics: [
          "Clustering: K-means, hierarchical clustering, DBSCAN",
          "Dimensionality Reduction: PCA, t-SNE, UMAP",
          "Association Rules: Market basket analysis, Apriori algorithm",
          "Anomaly Detection: Isolation Forest, One-class SVM",
          "Evaluation: Silhouette score, elbow method, cluster interpretation",
        ],
        project: "Customer segmentation for marketing strategy",
      },
    ],
  },
  {
    id: "06",
    title: "AI, Generative AI & Large Language Models",
    modules: [
      {
        title: "Introduction to Artificial Intelligence & Generative AI",
        topics: [
          "AI vs ML vs Deep Learning: Understanding the hierarchy",
          "Evolution of AI: From rule-based systems to neural networks",
          "What is Generative AI? Text, image, video, and audio generation",
          "Generative Models: GANs, VAEs, Transformers, Diffusion models",
          "AI Ethics & Bias: Responsible AI development and deployment",
          "Current AI Landscape: Major players, models, and applications",
        ],
        project: "Compare different AI model outputs for creative tasks",
      },
      {
        title: "LLM Fundamentals",
        topics: [
          "What are LLMs? Architecture and training process",
          "Transformer Architecture: Attention mechanisms, encoders, decoders",
          "Pre-training vs Fine-tuning: Understanding the training paradigm",
          "Popular LLMs: GPT series, BERT, T5, PaLM, Claude, Gemini",
          "Tokenization: How text is processed by LLMs",
          "Context Windows: Understanding input limitations",
        ],
        project: "Build a simple text generation application",
      },
      {
        title: "Working with LLM APIs",
        topics: [
          "OpenAI API: GPT-3.5, GPT-4, function calling",
          "Google AI APIs: Gemini, PaLM integration",
          "Anthropic Claude API: Constitutional AI principles",
          "Hugging Face Transformers: Open-source model access",
          "API Best Practices: Rate limiting, error handling, cost optimization",
          "Prompt Engineering: Crafting effective prompts",
        ],
        project: "Create a multi-LLM comparison tool",
      },
      {
        title: "Prompt Engineering & LLM Applications",
        topics: [
          "Prompt Design Principles: Clear instructions, examples, context",
          "Advanced Techniques: Few-shot learning, chain-of-thought, tree-of-thought",
          "Prompt Templates: Reusable patterns for different tasks",
          "LLM Use Cases: Content generation, summarization, translation, coding",
          "RAG (Retrieval-Augmented Generation): Combining LLMs with knowledge bases",
          "Function Calling: Integrating LLMs with external tools",
        ],
        project: "Build a RAG-based question-answering system",
      },
      {
        title: "Vector Databases & Embeddings",
        topics: [
          "Text Embeddings: Word2Vec, GloVe, BERT embeddings",
          "Sentence Transformers: Creating semantic embeddings",
          "Vector Similarity: Cosine similarity, Euclidean distance",
          "Vector Databases: Pinecone, Weaviate, Chroma, FAISS",
          "Embedding Applications: Semantic search, recommendation systems",
          "Chunking Strategies: Optimal text splitting for embeddings",
        ],
        project: "Build a semantic search engine for documents",
      },
      {
        title: "Fine-tuning & Model Customization",
        topics: [
          "When to Fine-tune: Use cases and considerations",
          "Fine-tuning Approaches: Full fine-tuning vs LoRA vs QLoRA",
          "Dataset Preparation: Formatting data for fine-tuning",
          "Training Process: Hyperparameters, evaluation metrics",
          "Model Evaluation: Benchmarking custom models",
          "Deployment Considerations: Serving fine-tuned models",
        ],
        project: "Fine-tune a model for domain-specific tasks",
      },
      {
        title: "Multi-modal AI & Advanced Applications",
        topics: [
          "Multi-modal Models: CLIP, DALL-E, GPT-4V, Gemini Vision",
          "Image Generation: Stable Diffusion, Midjourney concepts",
          "Voice AI: Speech-to-text, text-to-speech integration",
          "AI Agents: Building autonomous AI systems",
          "LangChain & LlamaIndex: Frameworks for LLM applications",
          "AI Safety: Alignment, hallucination detection, content filtering",
        ],
        project: "Build a multi-modal AI assistant",
      },
    ],
  },
  {
    id: "07",
    title: "Advanced Topics & Specializations",
    modules: [
      {
        title: "Natural Language Processing (NLP)",
        topics: [
          "Text Preprocessing: Cleaning, tokenization, stemming, lemmatization",
          "Feature Extraction: Bag of words, TF-IDF, n-grams",
          "Sentiment Analysis: Rule-based and ML approaches",
          "Text Classification: Spam detection, topic classification",
          "Named Entity Recognition: Extracting information from text",
          "Word Embeddings: Word2Vec, GloVe basics",
        ],
        project: "Build a movie review sentiment analyzer",
      },
      {
        title: "Time Series Analysis",
        topics: [
          "Time Series Components: Trend, seasonality, noise",
          "Stationarity: Tests and transformations",
          "Moving Averages: Simple and exponential smoothing",
          "ARIMA Models: Autoregression, differencing, moving averages",
          "Seasonal Decomposition: STL decomposition",
          "Forecasting Evaluation: MAE, MAPE, forecast accuracy",
        ],
        project: "Stock price prediction or sales forecasting",
      },
      {
        title: "Introduction to Deep Learning",
        topics: [
          "Neural Network Fundamentals: Perceptron, multi-layer networks",
          "TensorFlow/Keras Basics: Building simple neural networks",
          "Activation Functions: ReLU, sigmoid, tanh",
          "Loss Functions & Optimizers: SGD, Adam, learning rate",
          "Image Classification: CNN basics with MNIST/CIFAR-10",
          "Transfer Learning: Using pre-trained models",
        ],
        project: "Build an image classifier for everyday objects",
      },
      {
        title: "Computer Vision Basics",
        topics: [
          "Image Processing: OpenCV fundamentals",
          "Feature Detection: Edges, corners, contours",
          "Image Classification: CNN architectures",
          "Object Detection: YOLO concepts",
          "Face Recognition: Basic implementations",
        ],
        project: "Build a face mask detection system",
      },
    ],
  },
  {
    id: "08",
    title: "Cloud & Deployment",
    modules: [
      {
        title: "Cloud Computing Fundamentals",
        topics: [
          "Cloud Platforms: AWS, Google Cloud, Azure overview",
          "Cloud Storage: S3, Google Cloud Storage",
          "Compute Services: EC2, Google Compute Engine",
          "Managed Services: AWS SageMaker, Google AI Platform",
          "Cost Management: Understanding pricing, optimization",
        ],
        project: "Deploy a model on cloud platform",
      },
      {
        title: "Model Deployment & MLOps",
        topics: [
          "Model Serialization: Pickle, joblib, ONNX",
          "API Development: Flask, FastAPI for model serving",
          "Containerization: Docker basics for ML applications",
          "Model Monitoring: Performance tracking, drift detection",
          "Version Control: Git for code, DVC for data and models",
          "CI/CD for ML: Automated testing and deployment",
        ],
        project: "End-to-end ML pipeline with monitoring",
      },
      {
        title: "Web Applications for Data Science",
        topics: [
          "Streamlit: Interactive web apps for ML models",
          "Dash/Plotly: Complex interactive dashboards",
          "Gradio: Quick ML demos and interfaces",
          "Heroku Deployment: Free hosting for prototypes",
          "User Authentication: Basic security concepts",
        ],
        project: "Deploy a complete ML web application",
      },
    ],
  },
  {
    id: "09",
    title: "Business Intelligence & Advanced Analytics",
    modules: [
      {
        title: "Business Intelligence Tools",
        topics: [
          "Power BI: Connecting data sources, DAX formulas",
          "Tableau: Advanced visualizations, calculated fields",
          "Google Data Studio: Free BI tool mastery",
          "Dashboard Design: KPIs, drill-downs, interactivity",
          "Data Storytelling: Executive presentations",
        ],
        project: "Create comprehensive business dashboard",
      },
      {
        title: "Advanced Analytics & Optimization",
        topics: [
          "Statistical Modeling: Advanced regression techniques",
          "Optimization: Linear programming, constraint optimization",
          "Simulation: Monte Carlo methods",
          "Causal Inference: Understanding causation vs correlation",
          "Experimental Design: A/B testing, factorial designs",
        ],
        project: "Business optimization case study",
      },
    ],
  },
  {
    id: "10",
    title: "Portfolio & Career Preparation",
    modules: [
      {
        title: "Portfolio Development",
        topics: [
          "Profile: Professional setup, README files",
          "Project Documentation: Clear explanations, code comments",
          "Jupyter Notebooks: Best practices, storytelling",
          "Portfolio Website: Showcase projects and skills",
          "Resume Building: ATS-friendly data science resumes",
          "LinkedIn Optimization: Professional networking",
        ],
        project: null,
      },
      {
        title: "Capstone Project Options",
        topics: [
          "E-commerce Recommendation System",
          "Healthcare Predictive Analytics",
          "Financial Risk Assessment Model",
          "Social Media Sentiment Analysis Platform",
          "Supply Chain Optimization",
          "Real Estate Price Prediction App",
          "Requirements: Data collection/cleaning, EDA, multiple ML models, deployment, business presentation",
        ],
        project: "Choose and complete one comprehensive capstone project",
      },
      {
        title: "Interview Preparation & Job Search",
        topics: [
          "Technical Interview Prep: Coding challenges, ML concepts",
          "Case Study Practice: Business problem solving",
          "Behavioral Interviews: STAR method, data science scenarios",
          "Salary Negotiation: Market research, negotiation tactics",
          "Job Search Strategy: Where to apply, networking tips",
          "Mock Interviews: Practice with feedback",
        ],
        project: null,
      },
    ],
  },
];

function buildTeachingContent(title, topics, project) {
  const topicSummary = topics.slice(0, 4).join("; ");
  const projectNote = project ? ` Capstone project: ${project}.` : "";
  return {
    beginner: `Introduction to ${title}. ${topicSummary}.${projectNote} Focus on intuition, real-world examples, and why each topic matters for data professionals.`,
    intermediate: `${title}: ${topics.join(" ")}.${projectNote} Connect theory to hands-on practice with datasets, code snippets, and industry scenarios.`,
    advanced: `Deep dive into ${title}. ${topics.join(" ")}.${projectNote} Cover edge cases, trade-offs, tooling choices, and how teams apply this in production data science workflows.`,
  };
}

function buildCrossQuestions(title, topics) {
  const t0 = topics[0]?.split(":")[0] || title;
  const t1 = topics[1]?.split(":")[0] || "a real dataset";
  const t2 = topics[2]?.split(":")[0] || "this concept";
  return [
    `Explain ${t0} with a real-world data science example.`,
    `How would you apply ${t1} in a practical project?`,
    `What is the most common mistake beginners make with ${t2}, and how do you avoid it?`,
  ];
}

const concepts = [];
let order = 0;

for (const section of SECTIONS) {
  section.modules.forEach((mod, moduleIndex) => {
    order += 1;
    const moduleNum = moduleIndex + 1;
    const objectives = mod.topics.slice(0, 6);
    if (mod.project) objectives.push(`Project: ${mod.project}`);

    concepts.push({
      id: `ds-${order}`,
      order,
      sectionId: section.id,
      sectionTitle: section.title,
      moduleNumber: moduleNum,
      title: `Module ${order}: ${mod.title}`,
      description: mod.topics[0] || mod.title,
      topics: mod.topics,
      project: mod.project || null,
      objectives,
      teachingContent: buildTeachingContent(mod.title, mod.topics, mod.project),
      crossQuestions: buildCrossQuestions(mod.title, mod.topics),
    });
  });
}

const curriculum = {
  technology: "Data Science",
  totalConcepts: concepts.length,
  sections: SECTIONS.map((s) => ({
    id: s.id,
    title: s.title,
    moduleCount: s.modules.length,
  })),
  concepts,
};

const outPath = path.join(__dirname, "../data/curriculums/datascience.json");
fs.writeFileSync(outPath, JSON.stringify(curriculum, null, 2), "utf8");
console.log(`✅ Wrote ${concepts.length} modules to ${outPath}`);
