"use strict";

// fetch branches
function listenBranches(callback) {
  return db.collection("branches")
    .orderBy("order")
    .onSnapshot(snapshot => {
      const branches = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      callback(branches);
    }, err => {
      console.error("error fetching branches:", err);
      callback([]);
    });
}

// get branches
async function getBranches() {
  try {
    const snap = await db.collection("branches").orderBy("order").get();
    return snap.docs.map(doc => ({ id: doc.id, ...doc.data() }));
  } catch (err) {
    throw new Error("Failed to fetch branches.");
  }
}

// upload file
async function uploadFile(file, folder = "uploads") {
  if (!file) return null;
  try {
    const fileName = `${folder}/${Date.now()}_${file.name.replace(/[^a-zA-Z0-9.]/g, "_")}`;
    const ref = storage.ref(fileName);
    await ref.put(file);
    return await ref.getDownloadURL();
  } catch (err) {
    throw new Error("File upload failed.");
  }
}

// submit app data
async function submitApplication(formData, files, onProgress = () => {}) {
  const uploadedUrls = {};
  const docFields = [
    "sslc_marks_card", "tc", "caste_certificate", "income_certificate",
    "study_certificate", "kannada_medium_certificate", "rural_quota_certificate",
    "special_quota_certificate", "aadhar_card", "student_photo"
  ];

  for (const field of docFields) {
    if (files[field]) {
      onProgress(`Uploading ${field.replace(/_/g, " ")}...`);
      try {
        uploadedUrls[field] = await uploadFile(files[field], "uploads");
      } catch (err) {
        throw new Error(`Upload failed for ${field}.`);
      }
    } else {
      uploadedUrls[field] = null;
    }
  }

  onProgress("Saving to database...");

  try {
    const studentDoc = {
      ...formData,
      ...uploadedUrls,
      submission_date: firebase.firestore.FieldValue.serverTimestamp(),
      status: "pending"
    };

    const docRef = await db.collection("students").add(studentDoc);
    onProgress("Done!");
    return docRef.id;
  } catch (err) {
    throw new Error("Failed to submit application.");
  }
}

// search student
async function searchStudentBySSLC(sslcRegister) {
  try {
    const snap = await db.collection("students")
      .where("SSLC_Register", "==", sslcRegister.trim())
      .limit(1)
      .get();
    
    if (snap.empty) return null;
    const doc = snap.docs[0];
    return { id: doc.id, ...doc.data() };
  } catch (err) {
    throw new Error("Student search failed.");
  }
}

// get students
async function getAllStudents() {
  try {
    const snap = await db.collection("students")
      .orderBy("submission_date", "desc")
      .get();
    return snap.docs.map(doc => ({ id: doc.id, ...doc.data() }));
  } catch (err) {
    throw new Error("Failed to load students.");
  }
}


// get verification record
async function getDocumentVerification(sslcRegister) {
  try {
    const snap = await db.collection("document_verifications")
      .where("SSLC_Register", "==", sslcRegister.trim())
      .limit(1)
      .get();
      
    if (snap.empty) return null;
    const doc = snap.docs[0];
    return { id: doc.id, ...doc.data() };
  } catch (err) {
    throw new Error("Failed to get verification data.");
  }
}

// save verification result
async function saveDocumentVerification(sslcRegister, verificationData, existingDocId = null) {
  try {
    const payload = {
      SSLC_Register: sslcRegister,
      ...verificationData,
      verified_at: firebase.firestore.FieldValue.serverTimestamp()
    };

    if (existingDocId) {
      await db.collection("document_verifications").doc(existingDocId).set(payload, { merge: true });
    } else {
      await db.collection("document_verifications").add(payload);
    }
  } catch (err) {
    throw new Error("Failed to save verification.");
  }
}


// allot seat
async function allotSeat(studentDocId, sslcRegister, branchDocId, allocatedCategory, feesPaid, receiptNumber) {
  try {
    const branchRef = db.collection("branches").doc(branchDocId);
    const allotmentRef = db.collection("seat_allotments").doc();
    const studentRef = db.collection("students").doc(studentDocId);

    return await db.runTransaction(async (transaction) => {
      const branchSnap = await transaction.get(branchRef);
      if (!branchSnap.exists) throw new Error("Branch not found");

      const branch = branchSnap.data();
      let seatType = null;

      if (branch.government_seats > 0) seatType = "government";
      else if (branch.donor_seats > 0) seatType = "donor";
      else if (branch.snq_seats > 0) seatType = "snq";
      else throw new Error("No available seats in this branch");

      transaction.update(branchRef, {
        [`${seatType}_seats`]: firebase.firestore.FieldValue.increment(-1)
      });

      transaction.set(allotmentRef, {
        SSLC_Register: sslcRegister,
        student_doc_id: studentDocId,
        branch_doc_id: branchDocId,
        branch_name: branch.name,
        allocated_category: allocatedCategory,
        seat_type: seatType,
        fees_paid: feesPaid,
        receipt_number: receiptNumber,
        allotment_date: firebase.firestore.FieldValue.serverTimestamp()
      });

      transaction.update(studentRef, {
        status: "allotted",
        allotted_branch: branch.name,
        allotted_category: allocatedCategory
      });

      return { success: true, message: `Seat allotted: ${seatType}`, category: seatType };
    });
  } catch (err) {
    throw err;
  }
}

// get seat allotments
async function getAllSeatAllotments() {
  try {
    const snap = await db.collection("seat_allotments")
      .orderBy("allotment_date", "desc")
      .get();
    return snap.docs.map(doc => ({ id: doc.id, ...doc.data() }));
  } catch (err) {
    throw new Error("Failed to load allotments.");
  }
}

// revoke allotment
async function deleteSeatAllotment(allotmentId) {
  try {
    const allotmentRef = db.collection("seat_allotments").doc(allotmentId);
    const allotmentSnap = await allotmentRef.get();
    if (!allotmentSnap.exists) throw new Error("Allotment missing");

    const allotment = allotmentSnap.data();
    const branchRef = db.collection("branches").doc(allotment.branch_doc_id);

    await db.runTransaction(async (transaction) => {
      transaction.update(branchRef, {
        [`${allotment.seat_type}_seats`]: firebase.firestore.FieldValue.increment(1)
      });
      transaction.delete(allotmentRef);
    });
  } catch (err) {
    throw new Error("Failed to delete allotment.");
  }
}


// verify with ai (mock)
async function verifyDocumentsWithClaudeAI(student) {
  try {
    await new Promise(resolve => setTimeout(resolve, 2000));

    return {
      verified: true,
      message: "Doc verification pass",
      details: {
        sslc_marks_card: "Valid",
        student_photo: "Clear",
        aadhar_card: "Valid",
        overall: "All documents appear authentic and legible."
      }
    };
  } catch (err) {
    throw new Error("AI verification failed.");
  }
}
