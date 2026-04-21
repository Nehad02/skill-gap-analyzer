#include<iostream>
using namespace std;

class Node {
public:
    string name;
    Node* down;
    Node* next;
    int flag;
};

class tree {
public:
    Node *root = NULL;
    Node *t1, *t2, *t3 = NULL;
    Node *ch_temp, *sec_temp, *sub_sec_temp = NULL;

    Node *create() {
        Node *newnode = new Node();
        cout << "Enter name: ";
        cin >> newnode->name;
        newnode->down = NULL;
        newnode->next = NULL;
        newnode->flag = 0;
        return newnode;
    }
    
    void insert_book();
    void insert_chapter();
    void insert_section();
    void sub_section();
    void display();
    void displayHelper(Node *, int);
};

void tree::insert_book() {
    Node *newnode = create();
    if (root == NULL) {
        root = newnode;
        cout<<"Book added!";
    } else {
        cout << "Book exists already!" << endl;
    }
}

void tree::insert_chapter() {
    Node *newnode = create();
    if (root->flag == 0) {
        root->down = newnode;
        root->flag = 1;
    } else {
        Node *temp = root->down;
        while (temp->next != NULL) {
            temp = temp->next;
        }
        temp->next = newnode;
    }
}

void tree::insert_section() {
    string chap;
    Node *temp = root;
    if (temp->flag == 1) {
        Node *t1 = temp->down;
        cout << "Enter the chapter in which you want to insert section: ";
        cin >> chap;
        Node *newnode = create();
        bool chapter_found = false;
        while (t1 != NULL) {
            if (t1->name == chap) {
                chapter_found = true;
                if (t1->flag == 0) {
                    t1->down = newnode;
                    t1->flag = 1;
                    t2 = newnode;
                } else {
                    Node *temp1 = t2;
                    while (temp1->next != NULL) {
                        temp1 = temp1->next;
                    }
                    temp1->next = newnode;
                }
                break;
            }
            t1 = t1->next;
        }
        if (!chapter_found) {
            cout << "Chapter not found!" << endl;
        }
    }
}

void tree::sub_section() {
    string sec;
    Node *temp = root;
    if (temp->flag == 1) {
        Node *t1 = temp->down;
        cout << "Enter the section in which you want to insert sub-section: ";
        cin >> sec;
        Node *newnode = create();
        
        while (t1 != NULL) {
            Node *t2 = t1->down;
            
            while (t2 != NULL) {
                if (t2->name == sec) {
                    if (t2->down == NULL) {
                        t2->down = newnode;
                        t2->flag = 1;
                        t3 = newnode;
                    } else {
                        Node *temp3 = t2->down;
                        while (temp3->next != NULL) {
                            temp3 = temp3->next;
                        }
                        temp3->next = newnode;
                    }
                    return;
                }
                t2 = t2->next;
            }
            t1 = t1->next;
        }
        
        cout << "Section not found!" << endl;
    }
}

void tree::display() {
    cout << "\n======== Book Structure ========\n";
    displayHelper(root, 0);
    cout << "================================\n";
}

void tree::displayHelper(Node* node, int level) {
    if (node == NULL) return;
    
    for (int i = 0; i < level; ++i) {
        cout << "    ";
    }
    
    cout << "|- " << node->name << endl;
    
    if (node->down != NULL) {
        displayHelper(node->down, level + 1);
    }
    
    if (node->next != NULL) {
        displayHelper(node->next, level);
    }
}

int main() {
    tree obj;
    int choice;
    do {
        cout << "\n======== MENU ========" << endl;
        cout << "1. Insert Book" << endl;
        cout << "2. Insert Chapter" << endl;
        cout << "3. Insert Section" << endl;
        cout << "4. Insert Sub-section" << endl;
        cout << "5. Display" << endl;
        cout << "6. Exit" << endl;
        cout << "Enter choice: ";
        cin >> choice;
        
        switch (choice) {
            case 1:
                obj.insert_book();
                break;
            case 2:
                obj.insert_chapter();
                break;
            case 3:
                obj.insert_section();
                break;
            case 4:
                obj.sub_section();
                break;
            case 5:
                obj.display();
                break;
            case 6:
                cout << "Exiting..." << endl;
                break;
            default:
                cout << "Invalid choice! Please enter a valid option." << endl;
        }
    } while (choice != 6);
    
    return 0;
}

