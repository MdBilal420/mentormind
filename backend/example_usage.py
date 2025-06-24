#!/usr/bin/env python3
"""
Example usage of the database service with sample transcription data
"""

import json
from services.database_service import DatabaseService

# Sample data from your request
SAMPLE_DATA = {
    "success": True,
    "filename": "What is Photosynthesis.mp3",
    "transcription": "All organisms need energy from food. Animals get food they need by eating plants, other animals, or both. Plants and animals are also the main food source for people too, but plants are different, and how they get the food they need is truly amazing. They make food through a special process called photosynthesis. The word photosynthesis is a compound word made up of the term photo, which means light, and synthesis, which means to put together. And that's just what plants do they use the energy and sunlight to make their own food. In order to photosynthesise, plants need more than just sunlight. They also need a part of air called carbon dioxide, two, and water, h two o. Plants take in the water they need from soil. At the tip of the roots are microscopic outgrowths called root hairs. Root hairs improve plant water absorption by increasing root surface area which allows the root hair cells to take in more water. Water moves from the root hairs into the roots. The roots contain specialized vessels called xylem. Water moves through the xylem, through the stem, to the leaves. It's in the leaves that most of the photosynthesis takes place. Remember that in order to photosynthesize, plants also need carbon dioxide from the air. They take in air through special openings called stomata found mostly on the underside of the leaves. Within many leaf cells are specialised structures called chloroplasts. Inside the chloroplasts is a green pigment called chlorophyll. The chlorophyll absorbs the all important sunlight, which is used to convert carbon dioxide and water into a type of sugar called glucose. The glucose, along with nutrients and minerals taken from the soil, are used by the plant for growth and survival. The process of photosynthesis also produces the gas oxygen. Most of the oxygen is released back into the air through the stomata. Did you know that plants are not the only organisms that photosynthesize? See if you can find out what other organisms are able to make their own food through photosynthesis. Thanks for learning. See you. You. Don't forget to subscribe.",
    "sentences": [
        {
            "text": "All organisms need energy from food.",
            "start": 7.44,
            "end": 10.42
        },
        {
            "text": "Animals get food they need by eating plants, other animals, or both.",
            "start": 11.12,
            "end": 17.055
        },
        {
            "text": "Plants and animals are also the main food source for people too, but plants are different, and how they get the food they need is truly amazing.",
            "start": 19.355,
            "end": 31.630001
        },
        {
            "text": "They make food through a special process called photosynthesis.",
            "start": 33.05,
            "end": 37.47
        },
        {
            "text": "The word photosynthesis is a compound word made up of the term photo, which means light, and synthesis, which means to put together.",
            "start": 40.010002,
            "end": 50.225
        },
        {
            "text": "And that's just what plants do they use the energy and sunlight to make their own food.",
            "start": 50.765,
            "end": 56.530003
        },
        {
            "text": "In order to photosynthesise, plants need more than just sunlight.",
            "start": 58.510002,
            "end": 62.850002
        },
        {
            "text": "They also need a part of air called carbon dioxide, two, and water, h two o.",
            "start": 63.39,
            "end": 71.115
        },
        {
            "text": "Plants take in the water they need from soil.",
            "start": 74.215,
            "end": 76.875
        },
        {
            "text": "At the tip of the roots are microscopic outgrowths called root hairs.",
            "start": 77.975,
            "end": 82.73
        },
        {
            "text": "Root hairs improve plant water absorption by increasing root surface area which allows the root hair cells to take in more water.",
            "start": 83.67,
            "end": 91.770004
        },
        {
            "text": "Water moves from the root hairs into the roots.",
            "start": 97.695,
            "end": 100.674995
        },
        {
            "text": "The roots contain specialized vessels called xylem.",
            "start": 101.215,
            "end": 104.435
        },
        {
            "text": "Water moves through the xylem, through the stem, to the leaves.",
            "start": 107.215,
            "end": 111.395
        },
        {
            "text": "It's in the leaves that most of the photosynthesis takes place.",
            "start": 116.39,
            "end": 120.729996
        },
        {
            "text": "Remember that in order to photosynthesize, plants also need carbon dioxide from the air.",
            "start": 124.46999,
            "end": 130.505
        },
        {
            "text": "They take in air through special openings called stomata found mostly on the underside of the leaves.",
            "start": 131.205,
            "end": 137.705
        },
        {
            "text": "Within many leaf cells are specialised structures called chloroplasts.",
            "start": 140.565,
            "end": 144.59
        },
        {
            "text": "Inside the chloroplasts is a green pigment called chlorophyll.",
            "start": 145.69,
            "end": 149.63
        },
        {
            "text": "The chlorophyll absorbs the all important sunlight, which is used to convert carbon dioxide and water into a type of sugar called glucose.",
            "start": 150.57,
            "end": 160.405
        },
        {
            "text": "The glucose, along with nutrients and minerals taken from the soil, are used by the plant for growth and survival.",
            "start": 162.70499,
            "end": 169.28499
        },
        {
            "text": "The process of photosynthesis also produces the gas oxygen.",
            "start": 171.345,
            "end": 175.8
        },
        {
            "text": "Most of the oxygen is released back into the air through the stomata.",
            "start": 176.82,
            "end": 181
        },
        {
            "text": "Did you know that plants are not the only organisms that photosynthesize?",
            "start": 182.82,
            "end": 186.84001
        },
        {
            "text": "See if you can find out what other organisms are able to make their own food through photosynthesis.",
            "start": 188.865,
            "end": 194.405
        },
        {
            "text": "Thanks for learning.",
            "start": 196.385,
            "end": 197.445
        },
        {
            "text": "See you.",
            "start": 197.905,
            "end": 198.645
        },
        {
            "text": "You.",
            "start": 206,
            "end": 206.16
        },
        {
            "text": "Don't forget to subscribe.",
            "start": 206.16,
            "end": 207.62
        }
    ]
}

def main():
    """Example usage of the database service"""
    
    # Initialize the database service
    db_service = DatabaseService()
    
    print("🚀 Example: Saving transcription data to Supabase")
    print("=" * 50)
    
    try:
        # Save the transcription data
        print(f"📝 Saving transcription: {SAMPLE_DATA['filename']}")
        transcription_id = db_service.save_transcription(
            filename=SAMPLE_DATA['filename'],
            transcription=SAMPLE_DATA['transcription'],
            sentences=SAMPLE_DATA['sentences'],
            file_type='audio',
            metadata={
                "topic": "Biology",
                "subject": "Photosynthesis",
                "educational_level": "High School",
                "duration_seconds": 207.62
            }
        )
        
        print(f"✅ Transcription saved with ID: {transcription_id}")
        
        # Retrieve the transcription
        print("\n📖 Retrieving saved transcription...")
        saved_transcription = db_service.get_transcription(transcription_id)
        
        if saved_transcription:
            print(f"✅ Retrieved transcription:")
            print(f"   - Filename: {saved_transcription['filename']}")
            print(f"   - Status: {saved_transcription['status']}")
            print(f"   - Sentence count: {saved_transcription['sentence_count']}")
            print(f"   - Created: {saved_transcription['created_at']}")
            
            # Show first few sentences
            if saved_transcription.get('sentences'):
                print(f"\n📝 First 3 sentences:")
                for i, sentence in enumerate(saved_transcription['sentences'][:3]):
                    print(f"   {i+1}. [{sentence['start']:.2f}s - {sentence['end']:.2f}s] {sentence['text']}")
        
        # Get user's transcription list
        print("\n📋 Getting user's transcription list...")
        transcriptions = db_service.get_user_transcriptions(limit=5)
        print(f"✅ Found {len(transcriptions)} transcriptions")
        
        # Get statistics
        print("\n📊 Getting transcription statistics...")
        stats = db_service.get_transcription_stats()
        print(f"✅ Statistics:")
        print(f"   - Total transcriptions: {stats['total_transcriptions']}")
        print(f"   - Status counts: {stats['status_counts']}")
        print(f"   - Total words: {stats['total_words']}")
        
        # Search for specific content
        print("\n🔍 Searching for 'photosynthesis'...")
        search_results = db_service.search_transcriptions("photosynthesis", limit=5)
        print(f"✅ Found {len(search_results)} matching transcriptions")
        
        print("\n🎉 Example completed successfully!")
        
    except Exception as e:
        print(f"❌ Error: {str(e)}")
        print("\n💡 Make sure you have:")
        print("   1. Set up your Supabase environment variables")
        print("   2. Run the database schema SQL in your Supabase dashboard")
        print("   3. Authenticated with Supabase")

if __name__ == "__main__":
    main() 