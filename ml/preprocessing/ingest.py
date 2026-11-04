"""Safe data ingestion module for DemandSense AI."""
from pathlib import Path
from typing import Union
import pandas as pd


def load_raw_dataset(file_path: Union[str, Path]) -> pd.DataFrame:
    """Safely loads a CSV sales dataset from disk into a pandas DataFrame.
    
    Args:
        file_path: Path to the CSV file.
        
    Returns:
        pd.DataFrame containing the raw ingested rows.
        
    Raises:
        FileNotFoundError: If the specified file does not exist.
        ValueError: If the file is empty or cannot be parsed as CSV.
    """
    path = Path(file_path)
    if not path.is_file():
        raise FileNotFoundError(f"File not found: {path}")

    if path.stat().st_size == 0:
        raise ValueError(f"File is empty: {path}")

    try:
        df = pd.read_csv(path, low_memory=False)
        return df
    except Exception as e:
        raise ValueError(f"Failed to parse CSV file: {e}") from e

