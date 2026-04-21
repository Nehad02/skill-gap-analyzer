import streamlit as st
import pandas as pd
from sklearn.preprocessing import MultiLabelBinarizer
from sklearn.model_selection import train_test_split
from sklearn.neighbors import KNeighborsClassifier

# Title
st.title("💡 Smart Skill Gap Analyzer + Career Predictor")

# Load dataset
data = pd.read_csv("job_dataset.csv")

# ---- CLEAN SKILLS ----
data['Skills'] = data['Skills'].astype(str).str.lower()
data['Skills'] = data['Skills'].apply(lambda x: x.split(';'))
data['Skills'] = data['Skills'].apply(lambda x: [i.strip() for i in x if i != '' and i != 'nan'])

# Remove empty
data = data[data['Skills'].apply(len) > 0]

# Reduce features
from collections import Counter
all_skills = [skill for sublist in data['Skills'] for skill in sublist]
common_skills = {s for s, c in Counter(all_skills).items() if c >= 5}
data['Skills'] = data['Skills'].apply(lambda x: [s for s in x if s in common_skills])

# Encode
mlb = MultiLabelBinarizer()
X = mlb.fit_transform(data['Skills'])
y = data['Title']

# Train model
X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2)
model = KNeighborsClassifier(n_neighbors=3)
model.fit(X_train, y_train)

# ---- USER INPUT ----
user_input = st.text_input("Enter your skills (comma separated):")

if st.button("Predict"):
    user_skills = [i.strip().lower() for i in user_input.split(",")]
    
    user_vector = mlb.transform([user_skills])
    prediction = model.predict(user_vector)[0]
    
    st.subheader(f"🎯 Predicted Role: {prediction}")
    
    # Skill gap
    role_skills = data.groupby('Title')['Skills'].apply(lambda x: set(sum(x, [])))
    required = list(role_skills[prediction])[:10]
    required_set = set(required)
    
    missing = required_set - set(user_skills)
    
    st.subheader("📉 Missing Skills:")
    for skill in list(missing)[:5]:
        st.write(f"- {skill}")
    
    # Match %
    match = len(set(user_skills) & required_set)
    total = len(set(user_skills) | required_set)
    percentage = (match / total) * 100
    
    st.subheader(f"📊 Match: {round(percentage,2)}%")