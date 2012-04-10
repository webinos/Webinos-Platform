using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;
using System.Web.Mvc;
using policyDB.CollectionClasses;
using PolicyBuilder.Models;
using policyDB.EntityClasses;

namespace PolicyBuilder.Controllers
{
    [HandleError]
    public class HomeController : Controller
    {
        public ActionResult Index(baseData vData,int? id)
        {
            if (id.HasValue)
                vData.Library = new LibraryEntity(id.Value);

            LibraryCollection lcoll = new LibraryCollection();
            lcoll.GetMulti(null);

            object selObj = vData.Library == null ? null : (object)vData.Library.Id;
            ViewData["databases"] = new SelectList(lcoll, "Id", "Name", selObj);

            return View(vData);
        }

        public ActionResult TimedOut(baseData vData)
        {
            TempData["message"] = "session timed out";
            return RedirectToAction("Index");
        }

        [AcceptVerbs(HttpVerbs.Post)]
        public ActionResult SetDatabase(baseData vData, int databaseId)
        {
            Response.Cookies["dbId"].Value = databaseId.ToString();
            Response.Cookies["dbId"].Expires = DateTime.MaxValue;

            return RedirectToAction("Index", "policy");
        }

        [AcceptVerbs(HttpVerbs.Post),ValidateInput(false)]
        public ActionResult EditDatabase(baseData vData, int id, FormCollection collection)
        {
            vData.Library = new LibraryEntity(id);
            bool isNew = vData.Library.IsNew;
            vData.Library.Name = Server.HtmlEncode(collection["Name"].ToString());
            vData.Library.Save();

            Response.Cookies["dbId"].Value = vData.Library.Id.ToString();
            Response.Cookies["dbId"].Expires = DateTime.MaxValue;

            TempData["message"] = policyData.detailsSaved;

            if (isNew)
                return RedirectToAction("Index", "policy");
            else
                return RedirectToAction("Index", "Home");
        }

        public ActionResult SelectDatabase(baseData vData)
        {
            Response.Cookies["dbId"].Value = string.Empty;

            return RedirectToAction("Index", "Home");
        }

        public ActionResult DeleteDatabase(baseData vData, int id)
        {
            vData.Library = new LibraryEntity(id);
            try
            {
                policyController.DeleteEntireLibrary(id, true);
            }
            catch (Exception ex)
            {
                TempData["message"] = ex.Message;
            }

            Response.Cookies["dbId"].Value = string.Empty;

            return RedirectToAction("Index", "Home");
        }

        public ActionResult CreateDatabase(baseData vData)
        {
            Response.Cookies["dbId"].Value = "0";

            return RedirectToAction("Index", "Home");
        }
    }
}
