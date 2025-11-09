#!/bin/bash

# Color codes for output
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

BASE_URL="http://localhost:3000/api/v1"

echo -e "${BLUE}================================${NC}"
echo -e "${BLUE}Comment System Testing Script${NC}"
echo -e "${BLUE}================================${NC}\n"

# You'll need to replace these with actual IDs from your database
ITEM_ID="your_item_id_here"
STUDENT_ID_1="your_student_id_1_here"
STUDENT_ID_2="your_student_id_2_here"
STUDENT_USERNAME_1="john"
STUDENT_USERNAME_2="mary"

echo -e "${YELLOW}Note: Update the IDs in this script with real values from your database${NC}\n"

# Test 1: Create a main comment with mentions
echo -e "${GREEN}Test 1: Creating a comment with mentions${NC}"
COMMENT_RESPONSE=$(curl -s -X POST "${BASE_URL}/comments" \
  -H "Content-Type: application/json" \
  -d '{
    "text": "Has anyone seen this? @'"${STUDENT_USERNAME_2}"' please check!",
    "itemId": "'"${ITEM_ID}"'",
    "commentedBy": "'"${STUDENT_ID_1}"'"
  }')

echo "$COMMENT_RESPONSE" | jq '.'
COMMENT_ID=$(echo "$COMMENT_RESPONSE" | jq -r '.data._id')
echo -e "\n"

# Test 2: Get comments for an item
echo -e "${GREEN}Test 2: Getting all comments for an item${NC}"
curl -s "${BASE_URL}/comments/item/${ITEM_ID}" | jq '.'
echo -e "\n"

# Test 3: Reply to a comment
echo -e "${GREEN}Test 3: Replying to a comment${NC}"
REPLY_RESPONSE=$(curl -s -X POST "${BASE_URL}/comments" \
  -H "Content-Type: application/json" \
  -d '{
    "text": "Thanks for tagging me @'"${STUDENT_USERNAME_1}"'! I will check it out.",
    "itemId": "'"${ITEM_ID}"'",
    "commentedBy": "'"${STUDENT_ID_2}"'",
    "parentCommentId": "'"${COMMENT_ID}"'"
  }')

echo "$REPLY_RESPONSE" | jq '.'
REPLY_ID=$(echo "$REPLY_RESPONSE" | jq -r '.data._id')
echo -e "\n"

# Test 4: Get replies for a comment
echo -e "${GREEN}Test 4: Getting replies for a comment${NC}"
curl -s "${BASE_URL}/comments/${COMMENT_ID}/replies" | jq '.'
echo -e "\n"

# Test 5: Like a comment
echo -e "${GREEN}Test 5: Liking a comment${NC}"
curl -s -X POST "${BASE_URL}/comments/${COMMENT_ID}/like" \
  -H "Content-Type: application/json" \
  -d '{
    "studentId": "'"${STUDENT_ID_2}"'"
  }' | jq '.'
echo -e "\n"

# Test 6: Update a comment
echo -e "${GREEN}Test 6: Updating a comment${NC}"
curl -s -X PUT "${BASE_URL}/comments/${COMMENT_ID}" \
  -H "Content-Type: application/json" \
  -d '{
    "text": "Updated: Has anyone seen this? @'"${STUDENT_USERNAME_2}"' @admin please verify!"
  }' | jq '.'
echo -e "\n"

# Test 7: Get mentions for a student
echo -e "${GREEN}Test 7: Getting mentions for a student${NC}"
curl -s "${BASE_URL}/comments/mentions/${STUDENT_ID_2}" | jq '.'
echo -e "\n"

# Test 8: Get comments by a student
echo -e "${GREEN}Test 8: Getting all comments by a student${NC}"
curl -s "${BASE_URL}/comments/student/${STUDENT_ID_1}" | jq '.'
echo -e "\n"

echo -e "${BLUE}================================${NC}"
echo -e "${BLUE}Testing Complete!${NC}"
echo -e "${BLUE}================================${NC}"
