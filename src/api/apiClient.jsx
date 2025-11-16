// Data storage using localStorage
const STORAGE_PREFIX = 'leetcourt_';

// Initialize data
const initializeData = () => {
  // Sample cases
  const cases = [
    {
      id: '1',
      title: 'People v. Carter',
      case_type: 'criminal',
      difficulty: 3,
      issue: '4th Amendment Search and Seizure',
      description: 'Whether evidence obtained during a warrantless search should be suppressed',
      facts: 'Police stopped defendant\'s vehicle for a broken taillight. During the stop, officers smelled marijuana and searched the vehicle without a warrant, finding illegal substances.',
      statutes: 'U.S. Constitution, Fourth Amendment; Federal Rules of Criminal Procedure 41; State Vehicle Code § 14.3',
      burden_of_proof: 'The prosecution must establish probable cause and justify the warrantless search under a recognized exception',
      user_argument: 'The officer had probable cause because the smell of marijuana alone justifies a vehicle search under the automobile exception',
      defense_thesis: 'The warrantless search was unconstitutional because the officer lacked sufficient probable cause and exceeded the lawful scope of any permissible exception',
      notes: 'Key issue is whether marijuana odor alone constitutes probable cause in jurisdictions where marijuana may be legal. Defense should challenge reliability of officer\'s observations and question whether exigent circumstances existed. Prosecution must establish clear timeline and articulate specific facts supporting probable cause.',
      evidence: [
        { name: 'Police Report', content: 'Officers detected strong odor of marijuana from vehicle', type: 'document' },
        { name: 'Dash Cam Footage', content: 'Video shows traffic stop and subsequent search', type: 'video' }
      ],
      precedents: [
        'Terry v. Ohio (1968) - Reasonable suspicion standard',
        'Arizona v. Gant (2009) - Vehicle search limitations'
      ],
      created_date: new Date().toISOString()
    },
    {
      id: '2',
      title: 'Smith v. MegaCorp Industries',
      case_type: 'civil',
      difficulty: 2,
      issue: 'Breach of Employment Contract',
      description: 'Employee claims wrongful termination and seeks damages',
      facts: 'Employee was terminated after 10 years without cause. Employment contract included specific termination procedures that were allegedly not followed.',
      statutes: 'California Labor Code §§ 2922, 2924; Restatement (Second) of Contracts § 205',
      burden_of_proof: 'The plaintiff must prove by preponderance of evidence that defendant breached the employment contract and that damages resulted',
      user_argument: 'MegaCorp followed proper at-will employment procedures and had legitimate business reasons for the termination',
      defense_thesis: 'The termination violated the implied covenant of good faith and fair dealing, as the company failed to follow its own contractual procedures',
      notes: 'Focus on whether the contract created implied obligations beyond at-will status. Plaintiff should emphasize 10-year tenure and company\'s failure to follow own written procedures. Defendant needs to establish business necessity and show no discriminatory motive.',
      evidence: [
        { name: 'Employment Contract', content: 'Contract requires 30-day notice and performance review', type: 'document' },
        { name: 'Termination Letter', content: 'Letter provides immediate termination without stated cause', type: 'document' }
      ],
      precedents: [
        'Foley v. Interactive Data Corp (1988) - Implied covenant of good faith',
        'Guz v. Bechtel National Inc. (2000) - At-will employment exceptions'
      ],
      created_date: new Date().toISOString()
    },
    {
      id: '3',
      title: 'Johnson v. City Hospital',
      case_type: 'torts',
      difficulty: 4,
      issue: 'Medical Malpractice and Negligence',
      description: 'Patient alleges surgical error resulted in permanent injury',
      facts: 'Plaintiff underwent routine surgery. Post-operative complications arose from alleged surgical errors. Medical records show deviation from standard procedures.',
      statutes: 'California Civil Code § 3333.2; Code of Civil Procedure § 340.5; Health & Safety Code § 1599',
      burden_of_proof: 'The plaintiff must establish by preponderance of evidence: (1) duty of care, (2) breach of that duty, (3) causation, and (4) damages',
      user_argument: 'The hospital followed standard medical procedures and the complications were an unfortunate but unavoidable risk of surgery',
      defense_thesis: 'The surgeon deviated from the accepted standard of care, directly causing preventable injuries and permanent harm to the patient',
      notes: 'Medical malpractice requires expert testimony establishing standard of care and causation. Plaintiff must prove deviation was more than mere error in judgment. Defense should establish informed consent and show complications were known risks. Battle of experts will be decisive.',
      evidence: [
        { name: 'Medical Records', content: 'Documentation of procedure and complications', type: 'document' },
        { name: 'Expert Testimony', content: 'Medical expert states procedure deviated from standard of care', type: 'testimony' }
      ],
      precedents: [
        'Landeros v. Flood (1976) - Physician duty of care',
        'Helling v. Carey (1974) - Standard of care in medical practice'
      ],
      created_date: new Date().toISOString()
    }
  ];

  // Always update cases to ensure notes field exists
  const existingCases = localStorage.getItem(`${STORAGE_PREFIX}cases`);
  if (!existingCases) {
    localStorage.setItem(`${STORAGE_PREFIX}cases`, JSON.stringify(cases));
  } else {
    // Migrate existing cases to add notes field if missing
    const parsedCases = JSON.parse(existingCases);
    const updatedCases = parsedCases.map(existingCase => {
      // Find matching case from defaults to get notes
      const defaultCase = cases.find(c => c.id === existingCase.id);
      if (defaultCase && !existingCase.notes) {
        return { ...existingCase, notes: defaultCase.notes };
      }
      return existingCase;
    });
    localStorage.setItem(`${STORAGE_PREFIX}cases`, JSON.stringify(updatedCases));
  }

  if (!localStorage.getItem(`${STORAGE_PREFIX}battles`)) {
    localStorage.setItem(`${STORAGE_PREFIX}battles`, JSON.stringify([]));
  }

  if (!localStorage.getItem(`${STORAGE_PREFIX}profiles`)) {
    localStorage.setItem(`${STORAGE_PREFIX}profiles`, JSON.stringify([]));
  }
};

// Generate unique ID
const generateId = () => {
  return `${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
};

// Generic storage operations
const storage = {
  get: (key) => {
    const data = localStorage.getItem(`${STORAGE_PREFIX}${key}`);
    return data ? JSON.parse(data) : null;
  },
  set: (key, value) => {
    localStorage.setItem(`${STORAGE_PREFIX}${key}`, JSON.stringify(value));
  },
  clear: (key) => {
    localStorage.removeItem(`${STORAGE_PREFIX}${key}`);
  }
};

// Entity operations
const createEntityManager = (entityName) => {
  return {
    list: async (sortBy = null) => {
      const items = storage.get(entityName) || [];
      if (sortBy) {
        const isDescending = sortBy.startsWith('-');
        const field = isDescending ? sortBy.substring(1) : sortBy;
        items.sort((a, b) => {
          const aVal = a[field] || 0;
          const bVal = b[field] || 0;
          return isDescending ? bVal - aVal : aVal - bVal;
        });
      }
      return items;
    },
    
    get: async (id) => {
      const items = storage.get(entityName) || [];
      return items.find(item => item.id === id);
    },
    
    create: async (data) => {
      const items = storage.get(entityName) || [];
      const newItem = {
        id: generateId(),
        ...data,
        created_date: new Date().toISOString(),
        updated_date: new Date().toISOString(),
      };
      items.push(newItem);
      storage.set(entityName, items);
      return newItem;
    },
    
    update: async (id, data) => {
      const items = storage.get(entityName) || [];
      const index = items.findIndex(item => item.id === id);
      if (index !== -1) {
        items[index] = {
          ...items[index],
          ...data,
          updated_date: new Date().toISOString(),
        };
        storage.set(entityName, items);
        return items[index];
      }
      throw new Error(`${entityName} with id ${id} not found`);
    },
    
    delete: async (id) => {
      const items = storage.get(entityName) || [];
      const filtered = items.filter(item => item.id !== id);
      storage.set(entityName, filtered);
      return { success: true };
    },
    
    filter: async (criteria) => {
      const items = storage.get(entityName) || [];
      return items.filter(item => {
        return Object.entries(criteria).every(([key, value]) => item[key] === value);
      });
    }
  };
};

// Authentication system
const auth = {
  currentUser: null,
  
  me: async () => {
    if (!auth.currentUser) {
      // Create a default user
      auth.currentUser = {
        id: 'user_1',
        email: 'demo@leetcourt.com',
        full_name: 'Demo User',
        created_date: new Date().toISOString(),
      };
    }
    return auth.currentUser;
  },
  
  login: async (email, password) => {
    auth.currentUser = {
      id: generateId(),
      email,
      full_name: email.split('@')[0],
      created_date: new Date().toISOString(),
    };
    return auth.currentUser;
  },
  
  logout: async () => {
    auth.currentUser = null;
    return { success: true };
  }
};

// AI integration for generating legal arguments
const aiIntegration = {
  InvokeLLM: async ({ prompt }) => {
    // Simulate AI response delay
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    // Generate contextual responses based on prompt content
    const responses = [
      "Your Honor, I must strongly object to the defense's characterization. The evidence clearly demonstrates that the defendant's actions violated established legal principles. The precedent set in Miranda v. Arizona compels us to examine the voluntariness of the statement.",
      "Counsel, the facts speak for themselves. The witness testimony corroborates the physical evidence. Under the standard established in Daubert v. Merrell Dow Pharmaceuticals, this evidence is both relevant and reliable.",
      "The defense fails to acknowledge the controlling authority here. As the Supreme Court held in Terry v. Ohio, reasonable suspicion is sufficient for a stop and frisk. The officer's actions were well within constitutional bounds.",
      "I appreciate my colleague's argument, but it overlooks critical case law. The Fourth Amendment protections, as interpreted in Katz v. United States, extend to situations where there is a reasonable expectation of privacy.",
      "Your Honor, the prosecution's theory of the case is fundamentally flawed. The burden of proof has not been met. As we know from Coffin v. United States, the presumption of innocence requires proof beyond a reasonable doubt."
    ];
    
    return {
      output: responses[Math.floor(Math.random() * responses.length)]
    };
  }
};

// Main API client
export const api = {
  entities: {
    Case: createEntityManager('cases'),
    Battle: createEntityManager('battles'),
    UserProfile: createEntityManager('profiles'),
  },
  
  auth: auth,
  
  integrations: {
    Core: aiIntegration
  },
  
  initialize: () => {
    initializeData();
  }
};

// Initialize on import
api.initialize();
