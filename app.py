import streamlit as st
import pandas as pd
import plotly.express as px
import os
import json
from datetime import datetime

# Set page config
st.set_page_config(
    page_title="CSV Analytics Dashboard",
    page_icon="📊",
    layout="wide"
)

# CSS for better styling
st.markdown("""
<style>
    .main-header {
        font-size: 2.5rem;
        font-weight: bold;
        margin-bottom: 1rem;
    }
    .section-header {
        font-size: 1.8rem;
        font-weight: bold;
        margin: 1rem 0;
    }
    .upload-section {
        background-color: #f0f2f6;
        padding: 1rem;
        border-radius: 0.5rem;
        margin-bottom: 1rem;
    }
    .success-msg {
        color: #0c9;
        font-weight: bold;
    }
    .file-list {
        margin: 1rem 0;
    }
</style>
""", unsafe_allow_html=True)

# Initialize session state
if 'uploaded_files' not in st.session_state:
    st.session_state.uploaded_files = []
if 'current_file' not in st.session_state:
    st.session_state.current_file = None

# File upload history file
HISTORY_FILE = "upload_history.json"

# Function to load upload history
def load_history():
    if os.path.exists(HISTORY_FILE):
        try:
            with open(HISTORY_FILE, 'r') as f:
                return json.load(f)
        except:
            return []
    return []

# Function to save upload history
def save_history(history):
    with open(HISTORY_FILE, 'w') as f:
        json.dump(history, f)

# Load existing history
upload_history = load_history()

# Main application header
st.markdown("<div class='main-header'>CSV Analytics Dashboard</div>", unsafe_allow_html=True)

# File upload section
st.markdown("<div class='section-header'>Upload CSV File</div>", unsafe_allow_html=True)
with st.container():
    st.markdown("<div class='upload-section'>", unsafe_allow_html=True)
    uploaded_file = st.file_uploader("Choose a CSV file", type="csv")
    
    if uploaded_file is not None and (st.session_state.current_file is None or st.session_state.current_file != uploaded_file.name):
        st.session_state.current_file = uploaded_file.name
        
        # Add to history if not already there
        if not any(item['filename'] == uploaded_file.name for item in upload_history):
            upload_history.append({
                'filename': uploaded_file.name,
                'upload_time': datetime.now().strftime("%Y-%m-%d %H:%M:%S"),
                'size': f"{uploaded_file.size / 1024:.2f} KB"
            })
            save_history(upload_history)
        
        st.markdown(f"<div class='success-msg'>✅ File {uploaded_file.name} uploaded successfully!</div>", unsafe_allow_html=True)
        
        # Read the CSV file
        try:
            df = pd.read_csv(uploaded_file)
            st.session_state.df = df
            st.session_state.columns = df.columns.tolist()
            st.success(f"CSV file loaded with {len(df)} rows and {len(df.columns)} columns.")
        except Exception as e:
            st.error(f"Error reading CSV file: {e}")
    st.markdown("</div>", unsafe_allow_html=True)

# Display uploaded files history
st.markdown("<div class='section-header'>Uploaded CSV Files</div>", unsafe_allow_html=True)
with st.container():
    st.markdown("<div class='file-list'>", unsafe_allow_html=True)
    if upload_history:
        # Create a dataframe from the history
        history_df = pd.DataFrame(upload_history)
        st.dataframe(history_df, use_container_width=True)
    else:
        st.info("No CSV files have been uploaded yet.")
    st.markdown("</div>", unsafe_allow_html=True)

# Data analysis section
if 'df' in st.session_state and st.session_state.df is not None:
    st.markdown("<div class='section-header'>Data Analysis</div>", unsafe_allow_html=True)
    
    # Data preview
    with st.expander("Data Preview", expanded=True):
        st.dataframe(st.session_state.df.head(10), use_container_width=True)
        
    # Column statistics
    with st.expander("Column Statistics", expanded=True):
        # Display summary statistics
        st.subheader("Summary Statistics")
        st.write(st.session_state.df.describe().T)
        
        # Display info about missing values
        st.subheader("Missing Values")
        missing_values = st.session_state.df.isnull().sum().reset_index()
        missing_values.columns = ['Column', 'Missing Values']
        missing_values['Percentage'] = (missing_values['Missing Values'] / len(st.session_state.df)) * 100
        st.dataframe(missing_values, use_container_width=True)
    
    # Data visualization
    st.markdown("<div class='section-header'>Data Visualization</div>", unsafe_allow_html=True)
    
    # Determine numerical and categorical columns
    numerical_cols = st.session_state.df.select_dtypes(include=['number']).columns.tolist()
    categorical_cols = st.session_state.df.select_dtypes(exclude=['number']).columns.tolist()
    
    # Visualization options
    col1, col2 = st.columns(2)
    
    # Numerical column visualization
    if numerical_cols:
        with col1:
            st.subheader("Numerical Data Analysis")
            num_col = st.selectbox("Select a numerical column", numerical_cols)
            chart_type = st.selectbox("Select chart type", ["Histogram", "Box Plot"])
            
            if chart_type == "Histogram":
                fig = px.histogram(st.session_state.df, x=num_col, title=f"Histogram of {num_col}")
                st.plotly_chart(fig, use_container_width=True)
            else:
                fig = px.box(st.session_state.df, y=num_col, title=f"Box Plot of {num_col}")
                st.plotly_chart(fig, use_container_width=True)
    
    # Categorical column visualization
    if categorical_cols:
        with col2:
            st.subheader("Categorical Data Analysis")
            cat_col = st.selectbox("Select a categorical column", categorical_cols)
            
            # Count plot for categorical data
            value_counts = st.session_state.df[cat_col].value_counts().reset_index()
            value_counts.columns = [cat_col, 'Count']
            fig = px.bar(value_counts, x=cat_col, y='Count', title=f"Count of {cat_col}")
            st.plotly_chart(fig, use_container_width=True)
    
    # Correlation analysis for numerical data
    if len(numerical_cols) > 1:
        with st.expander("Correlation Analysis", expanded=False):
            st.subheader("Correlation Matrix")
            corr = st.session_state.df[numerical_cols].corr()
            fig = px.imshow(corr, text_auto=True, aspect="auto", color_continuous_scale='RdBu_r')
            fig.update_layout(title="Correlation Matrix")
            st.plotly_chart(fig, use_container_width=True)
            
            # Scatter plot for correlation
            st.subheader("Correlation Scatter Plot")
            col_x = st.selectbox("Select X-axis column", numerical_cols, key="scatter_x")
            col_y = st.selectbox("Select Y-axis column", [col for col in numerical_cols if col != col_x], key="scatter_y")
            
            color_col = None
            if categorical_cols:
                color_option = st.selectbox("Color by (optional)", ["None"] + categorical_cols)
                if color_option != "None":
                    color_col = color_option
            
            fig = px.scatter(
                st.session_state.df, 
                x=col_x, 
                y=col_y, 
                color=color_col,
                title=f"Scatter Plot: {col_x} vs {col_y}"
            )
            st.plotly_chart(fig, use_container_width=True)
else:
    st.info("Please upload a CSV file to start analyzing data.")

# Add footer
st.markdown("---")
st.markdown("CSV Analytics Dashboard - Built with Streamlit") 