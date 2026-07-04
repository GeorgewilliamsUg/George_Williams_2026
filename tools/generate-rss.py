#!/usr/bin/env python3
"""
RSS 2.0 Feed Generator for Static Blog
Reads articles from _articles-src/, parses metadata, and generates rss.xml
"""

import os
import sys
import re
from pathlib import Path
from datetime import datetime
from typing import Dict, List, Optional
import xml.etree.ElementTree as ET
from email.utils import formatdate
import html

# Configuration
SITE_BASE_URL = os.environ.get('SITE_BASE_URL', 'https://jojjy.org')
ARTICLES_SRC_DIR = '_articles-src'
OUTPUT_FILE = 'rss.xml'

# Channel metadata
CHANNEL_TITLE = 'George & the Word'
CHANNEL_DESCRIPTION = 'Weekly notes on faith, work, church, marriage, and life lived under His word.'
CHANNEL_LANGUAGE = 'en-us'


def slugify(text: str) -> str:
    """Convert title to URL slug (matching PowerShell Slug function)."""
    s = text.lower()
    s = re.sub(r'[^a-z0-9]+', '-', s)
    s = s.strip('-')
    return s if s else 'article'


def escape_xml(text: str) -> str:
    """Escape XML special characters."""
    return html.escape(text, quote=True)


def parse_front_matter(content_lines: List[str]) -> tuple[Dict[str, str], List[str]]:
    """
    Parse YAML front-matter from the article if present.
    Returns: (front_matter_dict, remaining_lines)
    """
    fm = {}
    remaining_lines = content_lines
    
    if len(content_lines) > 0 and content_lines[0].strip() == '---':
        end = -1
        for i in range(1, len(content_lines)):
            if content_lines[i].strip() == '---':
                end = i
                break
        
        if end > -1:
            # Parse YAML lines
            for line in content_lines[1:end]:
                match = re.match(r'^\s*([A-Za-z0-9_-]+)\s*:\s*(.+)\s*$', line)
                if match:
                    k = match.group(1).lower()
                    v = match.group(2).strip()
                    # Remove quotes if present
                    if (v.startswith('"') and v.endswith('"')) or \
                       (v.startswith("'") and v.endswith("'")):
                        v = v[1:-1]
                    fm[k] = v
            
            # Remove front-matter from content
            if end < len(content_lines) - 1:
                remaining_lines = content_lines[end + 1:]
            else:
                remaining_lines = []
    
    return fm, remaining_lines


def parse_article(file_path: Path) -> Optional[Dict]:
    """
    Parse a single article file.
    Returns: dict with title, description, slug, date, link, or None if invalid.
    """
    try:
        with open(file_path, 'r', encoding='utf-8') as f:
            raw_lines = f.readlines()
        
        # Strip whitespace from lines
        content_lines = [line.rstrip('\n\r') for line in raw_lines]
        
        # Parse front-matter if present
        fm, content_lines = parse_front_matter(content_lines)
        
        # Remove empty lines at start
        content_lines = [line.strip() for line in content_lines]
        content_lines = [line for line in content_lines if line]
        
        if not content_lines:
            return None
        
        # Extract title and description
        if 'title' in fm:
            title = fm['title']
            # Remove title from content if it's repeated
            if content_lines and content_lines[0] == title:
                content_lines = content_lines[1:]
        else:
            if not content_lines:
                return None
            title = content_lines[0]
            content_lines = content_lines[1:]
        
        if 'description' in fm:
            description = fm['description']
            # Remove description from content if it's repeated
            if content_lines and content_lines[0] == description:
                content_lines = content_lines[1:]
        else:
            if not content_lines:
                description = 'Read the full reflection.'
            else:
                description = content_lines[0]
        
        # Get date: from front-matter or file modification time
        date_str = None
        if 'date' in fm:
            try:
                dt = datetime.strptime(fm['date'], '%Y-%m-%d')
                date_str = dt.strftime('%b %d, %Y')
            except (ValueError, TypeError):
                date_str = fm['date']
        else:
            # Use file modification time
            mtime = file_path.stat().st_mtime
            dt = datetime.fromtimestamp(mtime)
            date_str = dt.strftime('%b %d, %Y')
        
        # Parse date to datetime for RFC 822 conversion
        try:
            date_obj = datetime.strptime(date_str, '%b %d, %Y')
        except ValueError:
            # Fallback to file modification time if parsing fails
            mtime = file_path.stat().st_mtime
            date_obj = datetime.fromtimestamp(mtime)
        
        # Get slug
        if 'slug' in fm:
            slug = slugify(fm['slug'])
        else:
            slug = slugify(title)
        
        # Construct article URL
        article_url = f"{SITE_BASE_URL}/articles/{slug}/"
        
        return {
            'title': title,
            'description': description,
            'slug': slug,
            'date': date_obj,
            'date_str': date_str,
            'link': article_url,
            'pubdate_rfc822': formatdate(timeval=date_obj.timestamp(), localtime=False, usegmt=True),
        }
    
    except Exception as e:
        print(f"Error parsing {file_path}: {e}", file=sys.stderr)
        return None


def generate_rss(articles: List[Dict]) -> str:
    """Generate RSS 2.0 XML content."""
    # Create root element
    rss = ET.Element('rss', version='2.0')
    rss.set('xmlns:content', 'http://purl.org/rss/1.0/modules/content/')
    rss.set('xmlns:atom', 'http://www.w3.org/2005/Atom')
    
    channel = ET.SubElement(rss, 'channel')
    
    # Channel metadata
    ET.SubElement(channel, 'title').text = CHANNEL_TITLE
    ET.SubElement(channel, 'link').text = SITE_BASE_URL
    ET.SubElement(channel, 'description').text = CHANNEL_DESCRIPTION
    ET.SubElement(channel, 'language').text = CHANNEL_LANGUAGE
    ET.SubElement(channel, 'lastBuildDate').text = formatdate(localtime=False, usegmt=True)
    
    # Self link for feed discovery
    atom_link = ET.SubElement(channel, 'atom:link')
    atom_link.set('href', f"{SITE_BASE_URL}/rss.xml")
    atom_link.set('rel', 'self')
    atom_link.set('type', 'application/rss+xml')
    
    # Add items (articles)
    for article in articles:
        item = ET.SubElement(channel, 'item')
        
        ET.SubElement(item, 'title').text = article['title']
        ET.SubElement(item, 'link').text = article['link']
        ET.SubElement(item, 'description').text = article['description']
        ET.SubElement(item, 'pubDate').text = article['pubdate_rfc822']
        ET.SubElement(item, 'guid', isPermaLink='true').text = article['link']
    
    # Convert to XML string with proper declaration and formatting
    xml_str = ET.tostring(rss, encoding='unicode', method='xml')
    
    # Improve formatting
    dom = ET.fromstring(xml_str)
    xml_str = ET.tostring(dom, encoding='unicode')
    
    # Add XML declaration and ensure proper formatting
    xml_output = '<?xml version="1.0" encoding="UTF-8"?>\n' + xml_str
    
    return xml_output


def main():
    """Main entry point."""
    # Get root directory (parent of tools directory containing this script)
    script_dir = Path(__file__).parent
    root_dir = script_dir.parent
    articles_dir = root_dir / ARTICLES_SRC_DIR
    output_path = root_dir / OUTPUT_FILE
    
    if not articles_dir.exists():
        print(f"Error: {articles_dir} not found", file=sys.stderr)
        sys.exit(1)
    
    print(f"Reading articles from: {articles_dir}")
    print(f"Site base URL: {SITE_BASE_URL}")
    
    # Parse all articles
    articles = []
    for file_path in sorted(articles_dir.glob('*.txt')):
        article = parse_article(file_path)
        if article:
            articles.append(article)
    
    if not articles:
        print("Error: No articles found", file=sys.stderr)
        sys.exit(1)
    
    print(f"Found {len(articles)} articles")
    
    # Sort by date (newest first)
    articles.sort(key=lambda x: x['date'], reverse=True)
    
    # Generate RSS
    rss_content = generate_rss(articles)
    
    # Write to file
    with open(output_path, 'w', encoding='utf-8') as f:
        f.write(rss_content)
    
    print(f"Generated RSS feed: {output_path}")
    print(f"Feed contains {len(articles)} articles")
    
    return 0


if __name__ == '__main__':
    sys.exit(main())
