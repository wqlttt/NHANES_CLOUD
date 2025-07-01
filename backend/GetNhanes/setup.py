from pandas.io.sas.sas_constants import os_version_number_offset
from setuptools import setup, find_packages

setup(
    name="GetNhanes",
    version="0.1",
    packages=find_packages(),
    install_requires=[
        "pandas",
        "numpy"
    ],
    author="wqlt",
    author_email="P2415627@mpu.edu.mo",
    description="test",
    # long_description=open('README.md').read(),
    long_description_content_type='text/markdown',
    url="https://github.com/yourusername/mypackage",
    classifiers=[
        "Programming Language :: Python :: 3",
        "License :: OSI Approved :: MIT License",
        "Operating System :: OS Independent",
    ],
)