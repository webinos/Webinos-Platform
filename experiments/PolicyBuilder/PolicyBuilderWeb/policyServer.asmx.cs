using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;
using System.Web.Services;
using policyDB.CollectionClasses;
using policyDB.EntityClasses;
using SD.LLBLGen.Pro.ORMSupportClasses;
using policyDB.HelperClasses;
using PolicyBuilder.Models;

namespace PolicyBuilder
{
    /// <summary>
    /// Summary description for policyServer
    /// </summary>
    [WebService(Namespace = "http://tempuri.org/")]
    [WebServiceBinding(ConformsTo = WsiProfiles.BasicProfile1_1)]
    [System.ComponentModel.ToolboxItem(false)]
    [System.Web.Script.Services.ScriptService]
    public class policyServer : System.Web.Services.WebService
    {
        [Serializable]
        public class Library
        {
            public Library()
            {
            }

            public string Name { get; set; }
            public int Id { get; set; }
        }

        [Serializable]
        public class Document
        {
            public Document()
            {
            }

            public string Name { get; set; }
            public int Id { get; set; }
        }

        [WebMethod]
        public Library[] GetDocumentLibraries()
        {
            List<Library> libs = new List<Library>();

            LibraryCollection lcoll = new LibraryCollection();
            lcoll.GetMulti(null);

            foreach (LibraryEntity lib in lcoll)
            {
                Library wlib = new Library();
                wlib.Name = lib.Name;
                wlib.Id = lib.Id;
                libs.Add(wlib);
            }

            return libs.ToArray();
        }
        
        [WebMethod]
        public Document[] GetLibraryDocumentsById(int libraryId)
        {
            List<Document> docs = new List<Document>();

            PolicyDocumentCollection policyDocuments = new PolicyDocumentCollection();

            PredicateExpression pe = new PredicateExpression(PolicyDocumentFields.LibraryId == libraryId);

            SortExpression se = new SortExpression(PolicyDocumentFields.Name | SortOperator.Ascending);
            policyDocuments.GetMulti(pe, 0, se);

            foreach (PolicyDocumentEntity doc in policyDocuments)
            {
                Document wdoc = new Document();
                wdoc.Name = doc.Name;
                wdoc.Id = doc.Id;
                docs.Add(wdoc);
            }

            return docs.ToArray();
        }

        [WebMethod]
        public Document[] GetLibraryDocuments(string libraryName)
        {
            List<Document> docs = new List<Document>();

            PolicyDocumentCollection policyDocuments = new PolicyDocumentCollection();

            RelationCollection rels = new RelationCollection(PolicyDocumentEntity.Relations.LibraryEntityUsingLibraryId);

            PredicateExpression pe = new PredicateExpression(LibraryFields.Name == libraryName);

            SortExpression se = new SortExpression(PolicyDocumentFields.Name | SortOperator.Ascending);
            policyDocuments.GetMulti(pe, 0, se, rels);

            foreach (PolicyDocumentEntity doc in policyDocuments)
            {
                Document wdoc = new Document();
                wdoc.Name = doc.Name;
                wdoc.Id = doc.Id;
                docs.Add(wdoc);
            }

            return docs.ToArray();
        }

        [WebMethod]
        public string GetDocumentXML(int docId)
        {
            string xml = string.Empty;

            PolicyDocumentEntity pde = new PolicyDocumentEntity(docId);
            xmlGenerate gen = new xmlGenerate();
            xml = gen.generate(pde);

            return xml;
        }
    }
}
