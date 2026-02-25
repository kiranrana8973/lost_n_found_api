package main

import (
	"context"
	"fmt"
	"log/slog"
	"os"
	"time"

	"github.com/kiranrana/lost-n-found-api/config"
	"github.com/kiranrana/lost-n-found-api/database"
	"go.mongodb.org/mongo-driver/v2/bson"
	"go.mongodb.org/mongo-driver/v2/mongo"
	"golang.org/x/crypto/bcrypt"
)

func runSeed() {
	cfg := config.Load("./config/config.env")
	client, db := database.Connect(cfg.DatabaseURI)
	defer database.Disconnect(client)

	ctx := context.Background()

	if len(os.Args) > 1 && os.Args[1] == "--destroy" {
		destroySeed(ctx, db)
		return
	}

	seedData(ctx, db)
}

func destroySeed(ctx context.Context, db *mongo.Database) {
	collections := []string{"students", "batches", "categories", "items", "comments", "refreshtokens"}
	for _, col := range collections {
		result, err := db.Collection(col).DeleteMany(ctx, bson.D{})
		if err != nil {
			slog.Error("failed to clear collection", "collection", col, "error", err)
		} else {
			slog.Info("cleared collection", "collection", col, "deleted", result.DeletedCount)
		}
	}
	slog.Info("seed data destroyed")
}

func seedData(ctx context.Context, db *mongo.Database) {
	now := time.Now()

	batchNames := []string{"35-A", "35-B", "35-C", "35-D", "36-A", "36-B", "36-C", "36-D"}
	batchIDs := make([]bson.ObjectID, len(batchNames))
	var batchDocs []interface{}
	for i, name := range batchNames {
		id := bson.NewObjectID()
		batchIDs[i] = id
		batchDocs = append(batchDocs, bson.D{
			{Key: "_id", Value: id},
			{Key: "batchName", Value: name},
			{Key: "status", Value: "active"},
			{Key: "createdAt", Value: now},
		})
	}
	insertMany(ctx, db, "batches", batchDocs)
	slog.Info("seeded batches", "count", len(batchDocs))

	type cat struct {
		name string
		desc string
	}
	categories := []cat{
		{"Electronics", "Phones, laptops, chargers, earbuds, etc."},
		{"Bags & Accessories", "Backpacks, wallets, purses, keychains"},
		{"Clothing", "Jackets, hoodies, shoes, hats"},
		{"Books & Stationery", "Textbooks, notebooks, calculators, pens"},
		{"ID & Cards", "Student ID, credit cards, access cards"},
		{"Keys", "Car keys, room keys, bike locks"},
		{"Sports & Fitness", "Water bottles, fitness trackers, sports gear"},
		{"Jewelry", "Necklaces, rings, watches, bracelets"},
		{"Eyewear", "Glasses, sunglasses, contact lens cases"},
		{"Others", "Miscellaneous items"},
	}
	catIDs := make([]bson.ObjectID, len(categories))
	var catDocs []interface{}
	for i, c := range categories {
		id := bson.NewObjectID()
		catIDs[i] = id
		catDocs = append(catDocs, bson.D{
			{Key: "_id", Value: id},
			{Key: "name", Value: c.name},
			{Key: "description", Value: c.desc},
			{Key: "status", Value: "active"},
			{Key: "createdAt", Value: now},
		})
	}
	insertMany(ctx, db, "categories", catDocs)
	slog.Info("seeded categories", "count", len(catDocs))

	type stu struct {
		name, email, username, phone string
	}
	students := []stu{
		{"Kiran Rana", "kiranrana@softwarica.edu.np", "kiranr", "+977-9801234500"},
		{"Sarah Johnson", "sarah.johnson@softwarica.edu.np", "sarahj", "+977-9801234501"},
		{"Michael Chen", "michael.chen@softwarica.edu.np", "mikechen", "+977-9801234502"},
		{"Emily Rodriguez", "emily.rodriguez@softwarica.edu.np", "emilyrod", "+977-9801234503"},
		{"James Wilson", "james.wilson@softwarica.edu.np", "jameswilson", "+977-9801234504"},
		{"Priya Patel", "priya.patel@softwarica.edu.np", "priyap", "+977-9801234505"},
		{"David Kim", "david.kim@softwarica.edu.np", "davidkim", "+977-9801234506"},
		{"Olivia Martinez", "olivia.martinez@softwarica.edu.np", "oliviam", "+977-9801234507"},
		{"Ryan Thompson", "ryan.thompson@softwarica.edu.np", "ryant", "+977-9801234508"},
		{"Sophia Lee", "sophia.lee@softwarica.edu.np", "sophialee", "+977-9801234509"},
		{"Alex Garcia", "alex.garcia@softwarica.edu.np", "alexg", "+977-9801234510"},
		{"Emma Brown", "emma.brown@softwarica.edu.np", "emmab", "+977-9801234511"},
		{"Daniel Singh", "daniel.singh@softwarica.edu.np", "daniels", "+977-9801234512"},
	}

	hashedPw, _ := bcrypt.GenerateFromPassword([]byte("password123"), 10)
	studentIDs := make([]bson.ObjectID, len(students))
	var stuDocs []interface{}
	for i, s := range students {
		id := bson.NewObjectID()
		studentIDs[i] = id
		stuDocs = append(stuDocs, bson.D{
			{Key: "_id", Value: id},
			{Key: "name", Value: s.name},
			{Key: "email", Value: s.email},
			{Key: "username", Value: s.username},
			{Key: "password", Value: string(hashedPw)},
			{Key: "phoneNumber", Value: s.phone},
			{Key: "batchId", Value: batchIDs[i%len(batchIDs)]},
			{Key: "profilePicture", Value: "default-profile.png"},
			{Key: "createdAt", Value: now},
		})
	}
	insertMany(ctx, db, "students", stuDocs)
	slog.Info("seeded students", "count", len(stuDocs))

	type itm struct {
		name, desc, typ, location, status string
		catIdx                            int
	}
	items := []itm{
		{"Black Backpack", "Lost near the library entrance. Has a red keychain attached.", "lost", "Library, Ground Floor", "available", 1},
		{"iPhone 14 Pro", "Found silver iPhone 14 Pro near cafeteria. Has a clear case.", "found", "Cafeteria, Main Building", "available", 0},
		{"Silver Hydroflask", "Lost 32oz silver Hydroflask with stickers.", "lost", "Gym, Sports Complex", "available", 6},
		{"TI-84 Calculator", "Found TI-84 Plus calculator in Room 302.", "found", "Room 302, Science Block", "available", 3},
		{"Brown Leather Wallet", "Lost brown leather wallet. Contains student ID.", "lost", "Parking Lot B", "available", 1},
		{"AirPods Pro", "Found AirPods Pro in white case near vending machine.", "found", "Student Lounge, 2nd Floor", "claimed", 0},
		{"Red Nike Hoodie", "Lost red Nike hoodie, size M. Left in lecture hall.", "lost", "Lecture Hall A, Main Building", "available", 2},
		{"Car Keys with Toyota Keychain", "Found set of car keys with Toyota keychain.", "found", "Parking Lot A", "available", 5},
		{"Prescription Glasses", "Lost black-framed prescription glasses in blue case.", "lost", "Computer Lab 1", "available", 8},
		{"Data Structures Textbook", "Found 'Data Structures and Algorithms' textbook.", "found", "Library, 3rd Floor", "available", 3},
		{"Purple Umbrella", "Lost purple folding umbrella near main entrance.", "lost", "Main Entrance", "available", 9},
		{"Fitbit Charge 5", "Found Fitbit Charge 5 fitness tracker, black band.", "found", "Gym, Locker Room", "available", 0},
		{"White Lab Coat", "Found white lab coat with name tag 'M. Chen'.", "found", "Chemistry Lab", "resolved", 2},
		{"SanDisk 64GB Pendrive", "Lost red SanDisk pendrive with important project files.", "lost", "Computer Lab 2", "available", 0},
		{"Skateboard", "Found wooden skateboard near bike rack.", "found", "Bike Rack, North Gate", "available", 9},
		{"MacBook Charger", "Lost Apple MacBook charger (USB-C, 67W).", "lost", "Library, Study Room 5", "available", 0},
		{"Gold Necklace", "Lost thin gold chain necklace in women's restroom.", "lost", "Restroom, 1st Floor Main", "available", 7},
		{"JBL Flip 6 Speaker", "Found black JBL Flip 6 bluetooth speaker.", "found", "Student Garden", "claimed", 0},
		{"Student ID Card", "Found student ID card for batch 35-A student.", "found", "Admin Office Corridor", "resolved", 4},
		{"Black Leather Jacket", "Lost black leather jacket, size L, from event night.", "lost", "Auditorium", "available", 2},
		{"Logitech Wireless Mouse", "Found Logitech M720 wireless mouse.", "found", "Room 405, IT Block", "available", 0},
		{"Organic Chemistry Lab Manual", "Lost organic chemistry lab manual with notes.", "lost", "Chemistry Lab 2", "available", 3},
		{"Samsung Galaxy Buds2", "Found white Samsung Galaxy Buds2 in charging case.", "found", "Cafeteria, 2nd Floor", "available", 0},
		{"Blue Denim Jacket", "Lost blue denim jacket with patches on sleeves.", "lost", "Student Common Room", "available", 2},
		{"Anker Power Bank", "Found Anker 20000mAh power bank, black.", "found", "Lecture Hall B", "available", 0},
	}

	itemIDs := make([]bson.ObjectID, len(items))
	var itemDocs []interface{}
	for i, it := range items {
		id := bson.NewObjectID()
		itemIDs[i] = id
		doc := bson.D{
			{Key: "_id", Value: id},
			{Key: "itemName", Value: it.name},
			{Key: "description", Value: it.desc},
			{Key: "type", Value: it.typ},
			{Key: "category", Value: catIDs[it.catIdx]},
			{Key: "location", Value: it.location},
			{Key: "media", Value: "default.jpg"},
			{Key: "mediaType", Value: "photo"},
			{Key: "isClaimed", Value: it.status == "claimed" || it.status == "resolved"},
			{Key: "reportedBy", Value: studentIDs[i%len(studentIDs)]},
			{Key: "status", Value: it.status},
			{Key: "createdAt", Value: now},
			{Key: "updatedAt", Value: now},
		}
		if it.status == "claimed" || it.status == "resolved" {
			doc = append(doc, bson.E{Key: "claimedBy", Value: studentIDs[(i+1)%len(studentIDs)]})
		}
		itemDocs = append(itemDocs, doc)
	}
	insertMany(ctx, db, "items", itemDocs)
	slog.Info("seeded items", "count", len(itemDocs))

	commentTexts := []string{
		"I think I saw this near the library yesterday around 4pm. Did you check with the lost and found office?",
		"This looks like mine! Can you provide more details about where exactly you found it?",
		"Hey @sarahj I found it! Come to the library front desk to pick it up.",
		"@mikechen is this yours? You mentioned losing your calculator last week.",
		"I checked the lost and found office but they don't have it. Still looking.",
		"Has anyone contacted campus security about this? They usually collect found items.",
		"I saw someone pick this up near the cafeteria. Try asking the staff there.",
		"This is definitely mine! I lost it last Tuesday. How can I claim it?",
		"@emilyrod check this out, isn't this the jacket you were looking for?",
		"Thanks for posting this! I'll come check if it's mine after my class at 2pm.",
		"I work at the library front desk. We have a few items that match this description.",
		"Just wanted to update - I found my item! Thanks to everyone who helped.",
		"Can you post a photo of the item? It would help identify if it's mine.",
		"@jameswilson I think this is yours. I saw you with a similar one yesterday.",
		"Pro tip: always check with campus security first. They have a lost and found box.",
		"I lost something similar but in a different color. Still keeping an eye out.",
		"This has been here for a while. If no one claims it, what happens to it?",
		"@priyap your name is on this textbook. Come pick it up from Room 302!",
		"I can confirm this was found near the gym. I was there when someone turned it in.",
		"Does anyone know the office hours for the lost and found? I need to check.",
		"@davidkim this looks like the one you described in class today!",
		"I'll be at the admin office tomorrow morning. Can hold it for the owner until then.",
		"Lost mine too in the same area. Wonder if there's a pattern here.",
		"Just a reminder to always label your belongings with your name and batch!",
		"@oliviam is this the charger you were asking about in the group chat?",
		"Found a similar item last week. People should be more careful with their stuff.",
		"Can the person who found this please bring it to the student affairs office?",
		"@ryant weren't you looking for something like this? Check the description.",
		"Update: the owner has been found and the item has been returned. Thanks all!",
		"This community is awesome. Third time someone helped me find my lost stuff!",
	}

	var commentDocs []interface{}
	for i, text := range commentTexts {
		id := bson.NewObjectID()
		commentDocs = append(commentDocs, bson.D{
			{Key: "_id", Value: id},
			{Key: "text", Value: text},
			{Key: "item", Value: itemIDs[i%len(itemIDs)]},
			{Key: "commentedBy", Value: studentIDs[(i+2)%len(studentIDs)]},
			{Key: "mentionedUsers", Value: bson.A{}},
			{Key: "isReply", Value: false},
			{Key: "likes", Value: bson.A{}},
			{Key: "isEdited", Value: false},
			{Key: "createdAt", Value: now},
			{Key: "updatedAt", Value: now},
		})
	}
	insertMany(ctx, db, "comments", commentDocs)
	slog.Info("seeded comments", "count", len(commentDocs))

	fmt.Println("\n✅ Seed data created successfully!")
	fmt.Println("\nTest credentials (all passwords: password123):")
	fmt.Println("  - kiranrana@softwarica.edu.np")
	fmt.Println("  - sarah.johnson@softwarica.edu.np")
	fmt.Println("  - michael.chen@softwarica.edu.np")
}

func insertMany(ctx context.Context, db *mongo.Database, collection string, docs []interface{}) {
	_, err := db.Collection(collection).InsertMany(ctx, docs)
	if err != nil {
		slog.Error("failed to seed", "collection", collection, "error", err)
		os.Exit(1)
	}
}
