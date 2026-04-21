import streamlit as st
import pandas as pd
from sklearn.preprocessing import MultiLabelBinarizer
from sklearn.model_selection import train_test_split
from sklearn.neighbors import KNeighborsClassifier
from collections import Counter

# ===== PAGE CONFIG =====
st.set_page_config(page_title="Skill Gap Analyzer", layout="wide")

# ===== TITLE =====
st.markdown("""
<h1 style='text-align: center; color: #00C9A7;'>
💡 Smart Skill Gap Analyzer
</h1>
<h4 style='text-align: center; color: gray;'>
Find your best career path instantly 🚀
</h4>
""", unsafe_allow_html=True)

st.markdown("---")

# ===== LOAD DATA =====
data = pd.read_csv("job_dataset.csv")

# ===== CLEAN DATA =====
data = data.dropna(subset=['Skills', 'Title'])
data['Title'] = data['Title'].astype(str)

data['Skills'] = data['Skills'].astype(str).str.lower()
data['Skills'] = data['Skills'].apply(lambda x: x.split(';'))
data['Skills'] = data['Skills'].apply(lambda x: [i.strip() for i in x if i != '' and i != 'nan'])

# remove empty
data = data[data['Skills'].apply(len) > 0]

# ===== FEATURE REDUCTION =====
all_skills = [skill for sublist in data['Skills'] for skill in sublist]
common_skills = {s for s, c in Counter(all_skills).items() if c >= 5}
data['Skills'] = data['Skills'].apply(lambda x: [s for s in x if s in common_skills])

# ===== ENCODING =====
mlb = MultiLabelBinarizer()
X = mlb.fit_transform(data['Skills'])
y = data['Title']

# ===== TRAIN MODEL =====
X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2)
model = KNeighborsClassifier(n_neighbors=3)
model.fit(X_train, y_train)

# ===== INPUT SECTION =====
st.markdown("### 💻 Enter your skills below")
user_input = st.text_input("Example: python, sql, machine learning")

if st.button("🔍 Predict Career"):

    if not user_input:
        st.warning("⚠️ Please enter your skills first")
    else:
        user_skills = [i.strip().lower() for i in user_input.split(",")]

        user_vector = mlb.transform([user_skills])
        prediction = model.predict(user_vector)[0]

        # ===== RESULT SECTION =====
        st.markdown("## 🎯 Career Prediction Result")

        col1, col2, col3 = st.columns(3)

        # Role
        with col1:
            st.metric("💼 Role", prediction)

        # Skill gap calculation
        role_skills = data.groupby('Title')['Skills'].apply(lambda x: set(sum(x, [])))
        required = list(role_skills[prediction])[:10]
        required_set = set(required)

        missing = required_set - set(user_skills)

        with col2:
            st.metric("📉 Missing Skills", len(missing))

        # Match %
        match = len(set(user_skills) & required_set)
        total = len(set(user_skills) | required_set)
        percentage = (match / total) * 100

        with col3:
            st.metric("📊 Match %", f"{round(percentage,2)}%")

        st.markdown("---")

        # ===== PROGRESS BAR =====
        st.subheader("📊 Match Progress")
        st.progress(int(percentage))

        st.markdown("---")

        # ===== MISSING SKILLS =====
        st.subheader("🚀 Skills You Should Learn")

        for skill in list(missing)[:5]:
            st.markdown(f"- 🔹 {skill}")

        st.markdown("---")

        # ===== FINAL MESSAGE =====
        if percentage > 50:
            st.success("🔥 Great! You are close to this role!")
        else:
            st.info("📚 Keep improving your skills to increase match!")
