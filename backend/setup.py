from setuptools import setup, find_packages

setup(
    name="get_nhanes",
    version="0.1.0",
    packages=find_packages(),
    install_requires=[
        "pandas",
        "numpy",
        "flask",
        "flask-cors",
        "python-dotenv",
    ],
    author="Your Name",
    description="NHANES data extraction and processing package",
    python_requires='>=3.8',
)
