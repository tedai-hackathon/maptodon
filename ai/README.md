# Maptodon AI Pipeline

This project contains the pipeline for performing 3D reconstruction using [Hierarchical-Localization](https://github.com/cvg/Hierarchical-Localization) and [COLMAP](https://colmap.github.io/), then [3D Gaussian Splatting](https://repo-sam.inria.fr/fungraph/3d-gaussian-splatting/) on images. The pipeline includes notebook which install necessary libraries and dependencies, preparing input images, performing structure from motion (SfM), and 3D reconstruction, running COLMAP image undistorter, and performing Gaussian splatting training.

## Getting Started

Click the badge below to open the notebook in Google Colab:

[![Open In Colab](https://colab.research.google.com/assets/colab-badge.svg)](https://colab.research.google.com/github/tedai-hackathon/maptodonblob/main/AI_pipeline/pipeline_notebook.ipynb)


## Utils
### `display_sorted_session_id.py`

This script is used for managing SQLite database entries based on session IDs and timestamps. It helps in listing session IDs in order and deleting duplicate sessions, retaining only the first entry of each session ID based on timestamp.

#### Usage:

```sh
python display_sorted_session_id.py --db_file=path_to_your_db_file
```

Replace `path_to_your_db_file` with the actual path to your SQLite database file. This script will then display all distinct session IDs in order of their timestamps and delete all but the first entry for each session ID.

### `split_sqlite.py`

This utility script is designed for splitting a larger SQLite database into smaller databases based on unique session IDs. Each new database contains all rows corresponding to a specific session ID.

#### Usage:

```sh
python split_sqlite.py --db_file=path_to_your_db_file --output_dir=path_to_output_directory
```

Replace `path_to_your_db_file` with the path to the SQLite database you want to split, and `path_to_output_directory` with the directory where you want to store the newly created databases. The script will then generate new SQLite databases for each unique session ID, each containing the rows associated with that particular session ID.

## Working Environment Setup for Hierarchical Localization and Gaussian Splatting

This README guides you through the process of setting up your working environment for using the Hierarchical Localization and Gaussian Splatting libraries. Ensure that you have Python 3.10 installed before proceeding. There are official repository, so if below steps doesn't work, please refer to the official repository. 

- [Hierarchical-Localization Documentation](https://github.com/cvg/Hierarchical-Localization)
- [Gaussian Splatting Documentation](https://github.com/graphdeco-inria/gaussian-splatting)


### Step 1: Installing Python Libraries

We will begin by installing the required Python libraries, including `plyfile`, `Pillow`, `pycolmap`, and `mediapy`. Execute the following commands:

```python
!pip install plyfile Pillow==9.5.0 pycolmap mediapy
```

### Step 2: Installing System Packages for COLMAP

COLMAP and FFmpeg are essential system packages for this setup. You can install them using the following commands:

```python
!apt-get install colmap ffmpeg
```

### Step 3: Cloning Hierarchical Localization and Installing Dependencies

Next, clone the Hierarchical Localization repository and install its dependencies with these commands:

```python
!git clone --quiet --recursive https://github.com/cvg/Hierarchical-Localization/
%cd Hierarchical-Localization
!pip install --quiet -e .
!pip install --quiet --upgrade plotly
```

### Step 4: Navigating Back to the Root Directory

Ensure you are in the root directory before proceeding to the next step.

```python
%cd ../
```

### Step 5: Cloning Gaussian Splatting

Now, clone the Gaussian Splatting repository using the command below:

```python
!git clone https://github.com/graphdeco-inria/gaussian-splatting.git
```

### Completion

Once all the above steps are executed successfully, your working environment is set up, and you're ready to proceed with your projects.


## Contributions

Contributions to improve the scripts or add new features are always welcome. Please fork this repository, make your proposed changes, and submit a pull request. Ensure that your code is clean and well-commented. Also, update the README if necessary to reflect any significant changes or additions you have made.

## License

This project is open source, under the [MIT License](LICENSE). You are free to use, modify, and distribute the code as per the terms of this license.
