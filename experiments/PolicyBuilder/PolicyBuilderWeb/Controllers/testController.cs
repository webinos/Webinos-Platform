//#define REMOTE_SERVICE 

using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;
using System.Web.Mvc;
using System.Web.Mvc.Ajax;
using PolicyBuilder.Models;
using policyDB.EntityClasses;
using SD.LLBLGen.Pro.ORMSupportClasses;

namespace PolicyBuilder.Controllers
{
    public class testController : Controller
    {
        //
        // GET: /test/

        public ActionResult SingleTest(testData vData, int id, int? queryId)
        {
            vData.PolicyDocument = new PolicyDocumentEntity(id);
            if (queryId.HasValue)
                vData.Query = new QueryEntity(queryId.Value);

            return View(vData);
        }

        public ActionResult Index(testData vData,int? id)
        {
            if (id.HasValue)
                vData.Library = new LibraryEntity(id.Value);

            return View(vData);
        }

        public ActionResult Matrix(testData vData,int? id)
        {
            if (id.HasValue)
                vData.Library = new LibraryEntity(id.Value);

            return View(vData);
        }

        [AcceptVerbs(HttpVerbs.Post)]
        public ActionResult TestPolicyDoc(testData vData, int id, FormCollection collection)
        {
            vData.PolicyDocument = new PolicyDocumentEntity(id);

            int? queryInstanceId = null;

            int parse;
            if (collection["queryInstanceId"] != null && int.TryParse(collection["queryInstanceId"], out parse))
            {
                queryInstanceId = parse;
                QueryEntity cie = new QueryEntity(queryInstanceId.Value);

                TempData["decision"] = TestPolicy(vData.PolicyDocument, cie);
            }

            return RedirectToAction("Index", new { id = vData.PolicyDocument.Id, queryId = queryInstanceId });
        }

        [AcceptVerbs(HttpVerbs.Post)]
        public ActionResult TestPolicy(testData vData, int id, int queryInstanceId)
        {
            vData.PolicyDocument = new PolicyDocumentEntity(id);
            QueryEntity cie = new QueryEntity(queryInstanceId);

            string decision = TestPolicy(vData.PolicyDocument, cie);

            return Json(new { result = decision, cId = cie.Id, docId = id });
        }

        static public string TestPolicy(PolicyDocumentEntity policyDoc, QueryEntity cie)
        {
            xmlGenerate gen = new xmlGenerate();
            string request = gen.generate(cie);
            string policy = gen.generate(policyDoc);

            string res = string.Empty;
            try
            {
#if REMOTE_SERVICE
                policyService.TestPolicy policyService = new PolicyBuilder.policyService.TestPolicy();
                res = policyService.Test(policy, request);
#else
                policyShimLib.TestPolicyClass tpc = new policyShimLib.TestPolicyClass();
                res = tpc.Test(policy, request);
#endif
            }
            catch (Exception ex)
            {
                res = "!!service down!! - try refresh " + ex.Message;
            }

            return res;
        }

        public ActionResult DuplicateQuery(testData vData, int docId, int id)
        {
            vData.PolicyDocument = new PolicyDocumentEntity(docId);
            vData.Query = new QueryEntity(id);

            QueryEntity newQuery = new QueryEntity(id);
            duplicator.MarkEntityDirty(newQuery);
            newQuery.IsNew = true;
            newQuery.Description += " copy";
            newQuery.Save();

            foreach (QueryValueEntity qve in vData.Query.QueryValue)
            {
                QueryValueEntity qveNew = new QueryValueEntity(qve.Id);
                duplicator.MarkEntityDirty(qveNew);
                qveNew.IsNew = true;
                qveNew.Query = newQuery;
                qveNew.Save();
            }

            return RedirectToAction("EditQuery", "test", new { docId = docId, id = newQuery.Id });
        }

        public ActionResult CreateQuery(testData vData, int docId)
        {
            vData.PolicyDocument = new PolicyDocumentEntity(docId);
            vData.Query = new QueryEntity();

            return View("EditQuery",vData);
        }

        public ActionResult EditQuery(testData vData, int docId, int id)
        {
            vData.PolicyDocument = new PolicyDocumentEntity(docId);
            vData.Query = new QueryEntity(id);

            return View(vData);
        }

        static public void DeleteQuery(int id)
        {
            QueryEntity query = new QueryEntity(id);

            foreach (QueryValueEntity cive in query.QueryValue)
            {
                cive.Delete();
            }

            query.Delete();
        }

        public ActionResult DeleteQuery(testData vData, int docId, int id)
        {
            vData.PolicyDocument = new PolicyDocumentEntity(docId);
            DeleteQuery(id);

            if (vData.PolicyDocument.IsNew)
                return RedirectToAction("Index", "test");
            else
                return RedirectToAction("EditPolicyDoc","policy",new { id = docId });
        }

        public ActionResult AddValue(testData vData, int id, int docId, FormCollection collection)
        {
            vData.PolicyDocument = new PolicyDocumentEntity(docId);

            vData.Query = new QueryEntity(id);
            if (vData.Query.IsNew)
                vData.Query.LibraryId = vData.Library.Id;

            vData.Query.Description = collection["description"];

            QueryValueEntity cive = new QueryValueEntity();
            int parse;
            if (collection["attributeId"] != null && int.TryParse(collection["attributeId"], out parse))
            {
                cive.AttributeId = parse;
                cive.Value = collection["attributeValue"];
                cive.Extra = collection["extra"];
                cive.Query = vData.Query;
            }

            vData.Query.Save(true);

            return RedirectToAction("EditQuery", new { docId = vData.PolicyDocument.Id, id = vData.Query.Id });
        }

        public ActionResult DeleteValue(testData vData, int id, int docId)
        {
            vData.PolicyDocument = new PolicyDocumentEntity(docId);

            QueryValueEntity cive = new QueryValueEntity(id);
            vData.Query = new QueryEntity(cive.QueryId);
            cive.Delete();

            return RedirectToAction("EditQuery", new { docId = vData.PolicyDocument.Id, id = vData.Query.Id });
        }
    }
}
