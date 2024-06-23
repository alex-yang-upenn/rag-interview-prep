import os

from dotenv import load_dotenv
load_dotenv()

from googleapiclient.discovery import build

import bs4

from selenium import webdriver
from selenium.webdriver.chrome.options import Options
from selenium.webdriver.common.by import By
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC

from langchain import hub
from langchain.schema import Document
from langchain_chroma import Chroma
from langchain_core.output_parsers import StrOutputParser
from langchain_core.runnables import RunnablePassthrough
from langchain_openai import OpenAIEmbeddings
from langchain_openai import ChatOpenAI
from langchain_text_splitters import RecursiveCharacterTextSplitter

OPEN_AI_SECRET = os.environ.get('OPEN_AI_SECRET')
GOOGLE_API_KEY = os.environ.get('GOOGLE_API_KEY')
GOOGLE_CSE_ID = os.environ.get('GOOGLE_CSE_ID')

def google_search_interview_q(search_term, api_key, cse_id, **kwargs):
    service = build("customsearch", "v1", developerKey=api_key)
    res = service.cse().list(q=search_term, cx=cse_id, **kwargs).execute()
    return [x['link'] for x in res['items']]

# Define SoupStrainer to filter content
def header_filter(x):
    # Ignores falsy values
    if not x:
        return False
    
    # Filter out all unwanted classes
    unwanted_classes = ['header', 'footer', 'nav', 'sidebar', 'menu', 'advertisement']
    return not any(cls in str(x).lower() for cls in unwanted_classes)

# Define additional post-processing function to filter content
def clean_content(html_content):
    soup = bs4.BeautifulSoup(html_content, 'html.parser')
    
    # Remove script and style elements
    for script in soup(["script", "style"]):
        script.decompose()
    
    # Remove links
    for a in soup.find_all('a'):
        a.decompose()
    
    # Get text
    text = soup.get_text()
    
    # Break into lines and remove leading and trailing space on each
    lines = (line.strip() for line in text.splitlines())
    lines = (line for line in lines if len(line.split()) > 5)
    
    # Break multi-headlines into a line each
    chunks = (phrase.strip() for line in lines for phrase in line.split("  "))
    
    # Drop blank lines
    text = '\n'.join(chunk for chunk in chunks if chunk)
    
    return text

# Load HTML Content with Selenium
def get_page_content(url):
    chrome_options = Options()
    chrome_options.add_argument("--headless")
    chrome_options.add_argument('--ignore-certificate-errors')
    driver = webdriver.Chrome(options=chrome_options)
    
    try:
        driver.get(url)
        
        # Wait for the content to load (adjust the timeout and conditions as needed)
        WebDriverWait(driver, 10).until(
            EC.presence_of_element_located((By.TAG_NAME, "body"))
        )
        
        # Get the page source after JavaScript execution
        page_source = driver.page_source
        return page_source
    finally:
        driver.quit()

def create_rag_vectorstore(websites):
    docs = []
    main_content_strainer = bs4.SoupStrainer(['p', 'div', 'article', 'section'], class_=header_filter)

    # Load, chunk and index the contents of each website.
    for url in websites:
        page_source = get_page_content(url)
        soup = bs4.BeautifulSoup(page_source, 'html.parser')
        filtered_content = soup.find_all(main_content_strainer)
        cleaned_content = clean_content(str(filtered_content))
        docs.append(Document(page_content=cleaned_content, metadata={"source": url}))
    
    text_splitter = RecursiveCharacterTextSplitter(chunk_size=1000, chunk_overlap=200)
    splits = text_splitter.split_documents(docs)
    return Chroma.from_documents(documents=splits, embedding=OpenAIEmbeddings())

def format_docs(docs):
    return "\n\n".join(doc.page_content for doc in docs)

def get_questions(job_type):
    os.environ["OPENAI_API_KEY"] = OPEN_AI_SECRET
    llm = ChatOpenAI(model="gpt-4o")

    search_results = google_search_interview_q(job_type + " Interview Questions", GOOGLE_API_KEY, GOOGLE_CSE_ID, num=5)    
    vectorstore = create_rag_vectorstore(search_results)
    
    # Retrieve and generate using the relevant snippets of the blog.
    retriever = vectorstore.as_retriever()
    prompt = hub.pull("rlm/rag-prompt")

    rag_chain = (
        {"context": retriever | format_docs, "question": RunnablePassthrough()}
        | prompt
        | llm
        | StrOutputParser()
    )

    interview_q = rag_chain.invoke(f"I am preparing to interview for a {job_type} job. Give me 5 practice interview questions. In your response, include only the questions, separated by newline characters")
    return interview_q.split("\n")