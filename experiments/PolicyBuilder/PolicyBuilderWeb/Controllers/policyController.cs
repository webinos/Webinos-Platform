using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;
using System.Web.Mvc;
using System.Web.Mvc.Ajax;
using PolicyBuilder.Models;
using policyDB.EntityClasses;
using policyDB.CollectionClasses;
using SD.LLBLGen.Pro.ORMSupportClasses;
using policyDB.HelperClasses;
using policyDB;
using System.IO;

namespace PolicyBuilder.Controllers
{
    public class policyController : Controller
    {
        public ActionResult Index(policyData vData, int? id)
        {
            if (id.HasValue)
                vData.Library = new LibraryEntity(id.Value);

            return View(vData);
        }

        #region LIBRARY
        public ActionResult Library(policyData vData,int? id)
        {
            if (id.HasValue)
                vData.Library = new LibraryEntity(id.Value);

            return View(vData);
        }

        public ActionResult CreatePolicyFromLib(policyData vData)
        {
            CreatePolicy(vData, null, false,true);

            return RedirectToAction("EditPolicy", new { id = vData.PolicyLink.Id });
        }

        public ActionResult EditPolicyFromLib(policyData vData, int id)
        {
            PredicateExpression pe = new PredicateExpression(PolicyLinkFields.ParentId == DBNull.Value);
            pe.Add(PolicyLinkFields.PolicyId == id);
            pe.Add(new FieldCompareSetPredicate(PolicyLinkFields.Id, PolicyDocumentFields.PolicyLinkId, SetOperator.In, null, true));

            PolicyLinkCollection plcoll = new PolicyLinkCollection();
            if (plcoll.GetMulti(pe) && plcoll.Count > 0)
                vData.PolicyLink = plcoll[0];
            else
            {
                vData.PolicyLink = new PolicyLinkEntity();
                vData.PolicyLink.PolicyId = id;
                vData.PolicyLink.Save();
            }

            return RedirectToAction("EditPolicy", new { id = vData.PolicyLink.Id });
        }

        static private bool DeletePolicyFromLib(int id)
        {
            PredicateExpression pe = new PredicateExpression(PolicyLinkFields.PolicyId == id);
            PredicateExpression peOr = new PredicateExpression(new FieldCompareSetPredicate(PolicyLinkFields.Id, PolicyDocumentFields.PolicyLinkId, SetOperator.In, null));
            peOr.AddWithOr(PolicyLinkFields.ParentId != DBNull.Value);
            pe.Add(peOr);

            PolicyLinkCollection plcoll = new PolicyLinkCollection();
            if (plcoll.GetMulti(pe) && plcoll.Count == 0)
            {
                // Policy isn't referenced in any policy document.
                PolicyEntity delPolicy = new PolicyEntity(id);
                delPolicy.PolicyLink.DeleteMulti();

                DeletePolicy(delPolicy);

                return true;
            }
            else
                return false;
        }

        public ActionResult DeletePolicyFromLib(policyData vData, int id)
        {
            try
            {
                if (!DeletePolicyFromLib(id))
                    TempData["message"] = "you can't delete this policy - it is in use";
            }
            catch (Exception ex)
            {
                TempData["message"] = "you can't delete this policy - it is in use";
            }

            return RedirectToAction("Library");
        }
        #endregion

        #region POLICY DOC
        public ActionResult EditPolicyDoc(policyData vData, int id)
        {
            vData.PolicyDocument = new PolicyDocumentEntity(id);
            if (!vData.PolicyDocument.IsNew)
                vData.Policy = vData.PolicyDocument.PolicyLink.Policy;

            return View(vData);
        }

        static private void DeletePolicyDoc(PolicyDocumentEntity pde)
        {
            PolicyLinkEntity policyLink = pde.PolicyLink;
            pde.Delete();

            if (!policyLink.IsNew)
                DeletePolicyLink(policyLink);
        }

        static public void DeleteEntireLibrary(int id)
        {
            DeleteEntireLibrary(id, false);
        }

        static public void DeleteEntireLibrary(int id, bool fullDelete)
        {
            LibraryEntity le = new LibraryEntity(id);
            if (le.IsNew)
                return;

            foreach (PolicyDocumentEntity pde in le.PolicyDocument)
            {
                DeletePolicyDoc(pde);
            }

            foreach (PolicyEntity pe in le.Policy)
            {
                DeletePolicyFromLib(pe.Id);
            }

            if (fullDelete)
            {
                foreach (QueryEntity qe in le.Query)
                {
                    testController.DeleteQuery(qe.Id);
                }

                le.Delete();
            }
        }

        public ActionResult DeletePolicyDoc(policyData vData, int id)
        {
            vData.PolicyDocument = new PolicyDocumentEntity(id);

            DeletePolicyDoc(vData.PolicyDocument);

            return RedirectToAction("Index");
        }

        public ActionResult DownloadPolicyDoc(policyData vData, int id)
        {
            vData.PolicyDocument = new PolicyDocumentEntity(id);

            string path = string.Format("~/exports/{0}.xml", Path.GetRandomFileName());
            string mappedPath = Server.MapPath(path);
            xmlGenerate gen = new xmlGenerate();
            string xml = gen.generate(vData.PolicyDocument);
            
            StreamWriter sw = new StreamWriter(mappedPath);
            sw.Write(xml);
            sw.Close();

            return File(mappedPath, "text/xml", vData.PolicyDocument.Name + ".xml");
        }

        public ActionResult ClearPolicyDoc(policyData vData, int id)
        {
            vData.PolicyDocument = new PolicyDocumentEntity(id);
            vData.PolicyLink = vData.PolicyDocument.PolicyLink;
            vData.PolicyDocument.PolicyLinkId = null;
            vData.PolicyDocument.Save();

            if (!vData.PolicyLink.IsNew)
                DeletePolicyLink(vData.PolicyLink);

            return RedirectToAction("EditPolicyDoc", new { id = id });
        }

        private string GetPolicyAction(PolicyEntity policy)
        {
            return policy.Set ? "EditPolicySet" : "EditPolicy";
        }

        public ActionResult CreateDocumentPolicy(policyData vData, int id)
        {
            vData.PolicyDocument = new PolicyDocumentEntity(id);
            CreatePolicy(vData, null, false,false);
            vData.PolicyDocument.PolicyLinkId = vData.PolicyLink.Id;
            vData.PolicyDocument.Save(true);

            return RedirectToAction(GetPolicyAction(vData.Policy), new { id = vData.PolicyLink.Id });
        }

        public ActionResult CreateDocumentPolicySet(policyData vData, int id)
        {
            vData.PolicyDocument = new PolicyDocumentEntity(id);
            CreatePolicy(vData, null, true,false);
            vData.PolicyDocument.PolicyLinkId = vData.PolicyLink.Id;
            vData.PolicyDocument.Save(true);

            return RedirectToAction("EditPolicySet", new { id = vData.PolicyLink.Id });
        }

        [AcceptVerbs(HttpVerbs.Post)]
        public ActionResult PolicyDocDetailUpdate(policyData vData, int id, FormCollection collection)
        {
            vData.PolicyDocument = new PolicyDocumentEntity(id);
            if (vData.PolicyDocument.IsNew)
                vData.PolicyDocument.LibraryId = vData.Library.Id;

            vData.PolicyDocument.Name = collection["name"];
            vData.PolicyDocument.Save(true);

            TempData["message"] = policyData.detailsSaved;

            return RedirectToAction("EditPolicyDoc", new { id = vData.PolicyDocument.Id });
        }

        #endregion

        #region POLICY SET

        public ActionResult EditPolicySet(policyData vData, int id)
        {
            SortExpression se = new SortExpression(PolicyLinkFields.Order | SortOperator.Ascending);
            PrefetchPath pp = new PrefetchPath(EntityType.PolicyLinkEntity);
            pp.Add(PolicyLinkEntity.PrefetchPathChildren, 0, null, null, se);
            vData.PolicyLink = new PolicyLinkEntity(id,pp);
            vData.PolicySet = vData.PolicyLink.Policy;

            return View(vData);
        }

        public ActionResult CreatePolicySetPolicySet(policyData vData, int id)
        {
            CreatePolicy(vData, id, true, false);
            vData.PolicySet = vData.Policy;
            return RedirectToAction("EditPolicySet", new { id = vData.PolicyLink.Id });
        }

        [AcceptVerbs(HttpVerbs.Post)]
        public ActionResult ReferencePolicy(policyData vData,int id, bool isDoc, FormCollection collection)
        {
            int parse;
            if (int.TryParse(collection["libraryPolicyId"], out parse) && parse > 0)
            {
                PolicyEntity copy = duplicator.dupPolicy(parse);

                vData.PolicyLink = new PolicyLinkEntity();
                vData.PolicyLink.PolicyId = copy.Id;

                if (isDoc)
                {
                    vData.PolicyDocument = new PolicyDocumentEntity(id);
                    vData.PolicyDocument.PolicyLink = vData.PolicyLink;
                    vData.PolicyDocument.Save(true);

                    return RedirectToAction("EditPolicyDoc", new { id = id });
                }
                else
                {
                    vData.PolicyLink.ParentId = id;

                    PolicyLinkCollection maxColl = new PolicyLinkCollection();
                    PredicateExpression pe = new PredicateExpression(PolicyLinkFields.ParentId == id);
                    object maxObj = maxColl.GetScalar(PolicyLinkFieldIndex.Order, null, AggregateFunction.Max, pe);
                    if (maxObj != null && maxObj != DBNull.Value)
                        vData.PolicyLink.Order = (int)maxObj + 1;
                    else
                        vData.PolicyLink.Order = 0;

                    vData.PolicyLink.Save();

                    return RedirectToAction("EditPolicySet", new { id = id });
                }
            }
            else
                return RedirectToAction("AddPolicy", new { id = id, isDoc = isDoc });
        }
    
        [AcceptVerbs(HttpVerbs.Post), ValidateInput(false)]
        public ActionResult CreatePolicySetPolicy(policyData vData, int id, bool isDoc, FormCollection collection)
        {
            if (isDoc)
            {
                vData.PolicyDocument = new PolicyDocumentEntity(id);
                CreatePolicy(vData, null, false, false);
                vData.PolicyDocument.PolicyLink = vData.PolicyLink;
                vData.PolicyDocument.Save(true);
            }
            else
            {
                CreatePolicy(vData, id, false, false);
            }

            if (collection["description"].Length > 0)
            {
                vData.Policy.Description = collection["description"];
                vData.Policy.Save();
            }
            
            return RedirectToAction("EditPolicy", new { id = vData.PolicyLink.Id });
        }

        [AcceptVerbs(HttpVerbs.Post)]
        public ActionResult PolicySetDetailUpdate(policyData vData, int id, int id2, FormCollection collection)
        {
            vData.PolicySet = new PolicyEntity(id);
            vData.PolicySet.Description = collection["description"];
            vData.PolicySet.CombineModeId = int.Parse(collection["combineModeId"]);
            vData.PolicySet.Save(true);

            TempData["message"] = policyData.detailsSaved;

            return RedirectToAction("EditPolicySet", new { id = id2 });
        }

        [AcceptVerbs(HttpVerbs.Post), ValidateInput(false)]
        public ActionResult PolicyOrder(policyData vData, int id, FormCollection collection)
        {
            PolicyLinkEntity policyLink = new PolicyLinkEntity(id);
            PolicyLinkCollection coll = new PolicyLinkCollection();

            PredicateExpression pe = new PredicateExpression(PolicyLinkFields.Id != policyLink.Id);
            pe.Add(PolicyLinkFields.ParentId == policyLink.ParentId);
            SortExpression se = null;

            if (collection["up"] != null)
            {
                // Find all categories with display index less than ours.
                pe.Add(PolicyLinkFields.Order <= policyLink.Order);

                // Order by display index, highest first.
                se = new SortExpression(PolicyLinkFields.Order | SortOperator.Descending);
            }
            else
            {
                // Find all categories with display index greater than ours.
                pe.Add(PolicyLinkFields.Order >= policyLink.Order);

                // Order by display index, lowest first.
                se = new SortExpression(PolicyLinkFields.Order | SortOperator.Ascending);
            }

            // Swap with closest one.
            if (coll.GetMulti(pe, 1, se) && coll.Count > 0)
            {
                int temp = coll[0].Order;
                coll[0].Order = policyLink.Order;
                policyLink.Order = temp;

                policyLink.Save();
                coll.SaveMulti();
            }

            return RedirectToAction("EditPolicySet", new { id = policyLink.ParentId });
        }
        #endregion

        #region POLICY
        public ActionResult AddPolicy(policyData vData, int id, bool isDoc)
        {
            vData.IsDocumentLink = isDoc;
            if (isDoc)
                vData.PolicyDocument = new PolicyDocumentEntity(id);
            else
                vData.PolicyLink = new PolicyLinkEntity(id);

            return View(vData);
        }

        public ActionResult EditPolicy(policyData vData, int id)
        {
            vData.PolicyLink = new PolicyLinkEntity(id);

            SortExpression se = new SortExpression(RuleFields.Order | SortOperator.Ascending);
            PrefetchPath pp = new PrefetchPath(EntityType.PolicyEntity);
            pp.Add(PolicyEntity.PrefetchPathRule, 0, null, null, se);
            vData.Policy = new PolicyEntity(vData.PolicyLink.PolicyId,pp);

            return View(vData);
        }

        private void CreatePolicy(policyData vData, int? id, bool set,bool isLibrary)
        {
            vData.Policy = new PolicyEntity();
            vData.Policy.LibraryId = vData.Library.Id;
            vData.Policy.Description = set ? "new policy set" : "new policy";
            vData.Policy.Set = set;
            vData.Policy.IsLibrary = isLibrary;
            vData.Policy.Target.Description = string.Empty;

            vData.PolicyLink = new PolicyLinkEntity();
            vData.PolicyLink.Policy = vData.Policy;

            if (id.HasValue)
            {
                vData.PolicyLink.ParentId = id;

                PolicyLinkCollection maxColl = new PolicyLinkCollection();
                PredicateExpression pe = new PredicateExpression(PolicyLinkFields.ParentId == id);
                object maxObj = maxColl.GetScalar(PolicyLinkFieldIndex.Order, null, AggregateFunction.Max, pe);
                if (maxObj != null && maxObj != DBNull.Value)
                    vData.PolicyLink.Order = (int)maxObj + 1;
                else
                    vData.PolicyLink.Order = 0;
            }

            CombineModeCollection cmcoll = new CombineModeCollection();
            cmcoll.GetMulti((CombineModeFields.Name == "deny-overrides"));
            vData.Policy.CombineModeId = cmcoll[0].Id;

            vData.Policy.Save(true);
        }

        static private void DeletePolicyLink(PolicyLinkEntity ple)
        {
            foreach (PolicyLinkEntity child in ple.Children)
            {
                DeletePolicyLink(child);
            }

            PolicyEntity delPolicy = ple.Policy;

            ple.Delete();

            DeletePolicy(delPolicy);
        }

        static private void DeletePolicy(PolicyEntity pe)
        {
            // Delete target conditions.
            foreach (DecisionNodeEntity ce in pe.Target.ConditionCollectionViaTargetCondition)
            {
                DeleteDecisionNode(ce);
            }

            // Delete rule conditions.
            foreach (RuleEntity re in pe.Rule)
            {
                DeleteDecisionNode(re.Condition);
            }

            // Delete the policy.
            pe.Delete();

            // Delete the target.
            pe.Target.Delete();
        }

        public ActionResult DeletePolicy(policyData vData, int id, int linkId)
        {
            vData.PolicyLink = new PolicyLinkEntity(id);
            DeletePolicyLink(vData.PolicyLink);

            return RedirectToAction("EditPolicySet", new { id = linkId });
        }

        [AcceptVerbs(HttpVerbs.Post)]
        public ActionResult PolicyDetailUpdate(policyData vData, int id, FormCollection collection)
        {
            vData.PolicyLink = new PolicyLinkEntity(id);
            vData.Policy = vData.PolicyLink.Policy;
            vData.Policy.Description = collection["description"];
            vData.Policy.CombineModeId = int.Parse(collection["combineModeId"]);
            vData.Policy.Save(true);

            TempData["message"] = policyData.detailsSaved;

            return RedirectToAction(GetPolicyAction(vData.Policy), new { id = vData.PolicyLink.Id });
        }

        [AcceptVerbs(HttpVerbs.Post), ValidateInput(false)]
        public ActionResult RuleOrder(policyData vData, int id, int linkId, FormCollection collection)
        {
            RuleEntity rule = new RuleEntity(id);
            RuleCollection coll = new RuleCollection();

            PredicateExpression pe = new PredicateExpression(RuleFields.Id != rule.Id);
            pe.Add(RuleFields.PolicyId == rule.PolicyId);
            SortExpression se = null;

            if (collection["up"] != null)
            {
                // Find all categories with display index less than ours.
                pe.Add(RuleFields.Order <= rule.Order);

                // Order by display index, highest first.
                se = new SortExpression(RuleFields.Order | SortOperator.Descending);
            }
            else
            {
                // Find all categories with display index greater than ours.
                pe.Add(RuleFields.Order >= rule.Order);

                // Order by display index, lowest first.
                se = new SortExpression(RuleFields.Order | SortOperator.Ascending);
            }

            // Swap with closest one.
            if (coll.GetMulti(pe, 1, se) && coll.Count > 0)
            {
                int temp = coll[0].Order;
                coll[0].Order = rule.Order;
                rule.Order = temp;

                rule.Save();
                coll.SaveMulti();
            }

            return RedirectToAction("EditPolicy", new { id = linkId });
        }
        #endregion

        #region CONDITION
        public ActionResult CreateTargetCondition(policyData vData, int id, int linkId)
        {
            vData.PolicyLink = new PolicyLinkEntity(linkId);

            vData.Target = new TargetEntity(id);
            vData.Condition = new DecisionNodeEntity();
            vData.Condition.Type = constants.conditionType;
            vData.Condition.CombineAnd = true;

            TargetConditionEntity tce = new TargetConditionEntity();
            tce.Target = vData.Target;
            tce.DecisionNode = vData.Condition;
            tce.Save(true);

            ViewData["title"] = "new target condition";

            return View("EditTarget",vData);
        }
        #endregion

        #region TARGET
        public ActionResult EditTarget(policyData vData, int id, int linkId)
        {
            vData.PolicyLink = new PolicyLinkEntity(linkId);

            SortExpression se = new SortExpression(DecisionNodeFields.Order | SortOperator.Ascending);
            PrefetchPath pp = new PrefetchPath(EntityType.DecisionNodeEntity);
            pp.Add(DecisionNodeEntity.PrefetchPathChildren, 0, null, null, se);
            vData.Condition = new DecisionNodeEntity(id,pp);

            ViewData["title"] = "edit target condition";

            return View(vData);
        }
        #endregion

        #region SUB-CONDITIONS
        public ActionResult CreateSubCondition(policyData vData, int id, int linkId)
        {
            vData.PolicyLink = new PolicyLinkEntity(linkId);

            DecisionNodeEntity ce = new DecisionNodeEntity(id);

            vData.Condition = new DecisionNodeEntity();
            vData.Condition.Type = constants.conditionType;
            vData.Condition.Parent = ce;
            
            DecisionNodeCollection maxColl = new DecisionNodeCollection();
            PredicateExpression pe = new PredicateExpression(DecisionNodeFields.ParentId == id);
            object maxObj = maxColl.GetScalar(DecisionNodeFieldIndex.Order, null, AggregateFunction.Max, pe);
            if (maxObj != null && maxObj != DBNull.Value)
                vData.Condition.Order = (int)maxObj + 1;
            else
                vData.Condition.Order = 0;

            vData.Condition.Save();

            ViewData["title"] = "new sub-condition";

            return View("EditCondition", vData);
        }

        public ActionResult EditCondition(policyData vData, int id, int linkId)
        {
            vData.PolicyLink = new PolicyLinkEntity(linkId);

            SortExpression se = new SortExpression(DecisionNodeFields.Order | SortOperator.Ascending);
            PrefetchPath pp = new PrefetchPath(EntityType.DecisionNodeEntity);
            pp.Add(DecisionNodeEntity.PrefetchPathChildren, 0, null, null, se);
            vData.Condition = new DecisionNodeEntity(id, pp);

            ViewData["title"] = "edit condition";

            return View(vData);
        }
        #endregion

        #region RULE
        public ActionResult CreateRule(policyData vData, int linkId)
        {
            vData.PolicyLink = new PolicyLinkEntity(linkId);
            vData.Policy = vData.PolicyLink.Policy;
            vData.Rule = new RuleEntity();
            vData.Rule.Policy = vData.Policy;
            vData.Rule.Condition.Type = constants.conditionType;
            vData.Condition = vData.Rule.Condition;
            vData.Condition.CombineAnd = true;

            RuleCollection maxColl = new RuleCollection();
            PredicateExpression pe = new PredicateExpression(RuleFields.PolicyId == vData.PolicyLink.PolicyId);
            object maxObj = maxColl.GetScalar(RuleFieldIndex.Order, null, AggregateFunction.Max, pe);
            if (maxObj != null && maxObj != DBNull.Value)
                vData.Rule.Order = (int)maxObj + 1;
            else
                vData.Rule.Order = 0;

            EffectCollection ecoll = new EffectCollection();
            ecoll.GetMulti((EffectFields.Name == "permit"));
            vData.Rule.EffectId = ecoll[0].Id;

            vData.Rule.Save(true);

            return RedirectToAction("EditRule", new { id = vData.Rule.Id, linkId = linkId });
        }

        public ActionResult EditRule(policyData vData, int id, int linkId)
        {
            vData.PolicyLink = new PolicyLinkEntity(linkId);

            SortExpression se = new SortExpression(DecisionNodeFields.Order | SortOperator.Ascending);
            PrefetchPath pp = new PrefetchPath(EntityType.RuleEntity);
            pp.Add(RuleEntity.PrefetchPathCondition).SubPath.Add(DecisionNodeEntity.PrefetchPathChildren, 0, null, null, se);
            vData.Rule = new RuleEntity(id, pp);
            vData.Condition = vData.Rule.Condition;

            return View(vData);
        }

        public ActionResult DeleteRule(policyData vData, int id, int linkId)
        {
            vData.Rule = new RuleEntity(id);
            DeleteDecisionNode(vData.Rule.Condition);

            return RedirectToAction("EditPolicy",new { id = linkId });
        }

        [AcceptVerbs(HttpVerbs.Post)]
        public ActionResult SetRuleEffect(policyData vData, int id, int linkId, FormCollection collection)
        {
            vData.Rule = new RuleEntity(id);
            vData.Rule.EffectId = int.Parse(collection["EffectId"]);
            vData.Rule.Save(true);

            TempData["message"] = policyData.detailsSaved;

            return RedirectToAction("EditRule", new { id = vData.Rule.Id, linkId = linkId });
        }

        #endregion

        #region ATTRIBUTE MATCH

        public ActionResult CreateMatch(policyData vData, int id, int linkId)
        {
            vData.PolicyLink = new PolicyLinkEntity(linkId);

            vData.Condition = new DecisionNodeEntity(id);
            vData.DecisionNode = new DecisionNodeEntity();
            vData.DecisionNode.Type = constants.attributeMatchType;
            vData.DecisionNode.Parent = vData.Condition;

            ViewData["title"] = "new match";

            if (vData.DecisionNode.Parent.Rule.Count > 0)
                ViewData["selectList"] = vData.allAttributes(vData.DecisionNode.AttributeId);
            else
                ViewData["selectList"] = vData.subjectAttributes(vData.DecisionNode.AttributeId);

            return View("EditMatch", vData);
        }

        public ActionResult EditMatch(policyData vData, int id, int linkId)
        {
            vData.PolicyLink = new PolicyLinkEntity(linkId);

            SortExpression se = new SortExpression(AttributeValueFields.Order | SortOperator.Ascending);
            PrefetchPath pp = new PrefetchPath(EntityType.DecisionNodeEntity);
            pp.Add(DecisionNodeEntity.PrefetchPathAttributeValue, 0, null, null, se);
            vData.DecisionNode = new DecisionNodeEntity(id,pp);

            ViewData["title"] = "edit match";

//            if (vData.DecisionNode.Parent.Rule.Count > 0)
                ViewData["selectList"] = vData.allAttributes(vData.DecisionNode.AttributeId);
            //else
            //    ViewData["selectList"] = vData.subjectAttributes(vData.DecisionNode.AttributeId);

            return View(vData);
        }

        public ActionResult DeleteDecisionNode(policyData vData, int id, int linkId)
        {
            vData.PolicyLink = new PolicyLinkEntity(linkId);
            vData.DecisionNode = new DecisionNodeEntity(id);

            string redirectAction;
            int redirectId;
            if (!vData.DecisionNode.ParentId.HasValue)
            {
                redirectAction = GetPolicyAction(vData.PolicyLink.Policy);
                redirectId = vData.PolicyLink.Id;
            }
            else if (vData.DecisionNode.Parent.ParentId.HasValue)
            {
                // This is a sub-condition rather than a top-level target condition or rule condition.
                redirectAction = "EditCondition";
                redirectId = vData.DecisionNode.ParentId.Value;
            }
            else if (vData.DecisionNode.Parent.TargetCondition.Count > 0)
            {
                redirectAction = "EditCondition";
                redirectId = vData.DecisionNode.Parent.Id;
            }
            else
            {
                redirectAction = "EditRule";
                redirectId = vData.DecisionNode.Parent.Rule[0].Id;
            }

            DeleteDecisionNode(vData.DecisionNode);

            return RedirectToAction(redirectAction, new { id = redirectId, linkId = linkId });
        }

        static private void DeleteDecisionNode(DecisionNodeEntity de)
        {
            foreach (DecisionNodeEntity child in de.Children)
            {
                DeleteDecisionNode(child);
            }

            de.AttributeValue.DeleteMulti();
            de.TargetCondition.DeleteMulti();
            de.Rule.DeleteMulti();
            de.Delete();
        }

        public ActionResult AddValue(policyData vData, int id, bool literal, int linkId)
        {
            AttributeValueEntity ave = new AttributeValueEntity();
            ave.AttributeMatchId = id;
            ave.Literal = literal;

            AttributeValueCollection maxColl = new AttributeValueCollection();
            PredicateExpression pe = new PredicateExpression(AttributeValueFields.AttributeMatchId == id);
            object maxObj = maxColl.GetScalar(AttributeValueFieldIndex.Order, null, AggregateFunction.Max,pe);
            if (maxObj != null && maxObj != DBNull.Value)
                ave.Order = (int)maxObj + 1;
            else
                ave.Order = 0;

            if (literal)
                ave.Value = string.Empty;
            else
                ave.Value = null;

            ave.Save();

            return RedirectToAction("EditMatch", new { id = id, linkId = linkId });
        }

        public ActionResult DeleteValue(policyData vData, int id, int valueId, int linkId)
        {
            AttributeValueEntity ave = new AttributeValueEntity(valueId);
            ave.Delete();

            return RedirectToAction("EditMatch", new { id = id, linkId = linkId });
        }

        [AcceptVerbs(HttpVerbs.Post)]
        public ActionResult SetConditionOperator(policyData vData, int id, int linkId, FormCollection collection)
        {
            vData.Condition = new DecisionNodeEntity(id);
            vData.Condition.CombineAnd = collection["operator"] == "AND" ? true : false;
            vData.Condition.Save();

            return RedirectToAction("EditCondition", new { id = id, linkId = linkId });
        }

        [AcceptVerbs(HttpVerbs.Post)]
        public ActionResult SetAttribute(policyData vData, int id, int id2, int linkId, FormCollection collection)
        {
            vData.DecisionNode = new DecisionNodeEntity(id);
            if (vData.DecisionNode.IsNew)
            {
                vData.DecisionNode.Type = constants.attributeMatchType;

                DecisionNodeCollection maxColl = new DecisionNodeCollection();
                PredicateExpression pe = new PredicateExpression(DecisionNodeFields.ParentId == id2);
                object maxObj = maxColl.GetScalar(DecisionNodeFieldIndex.Order, null, AggregateFunction.Max, pe);
                if (maxObj != null && maxObj != DBNull.Value)
                    vData.DecisionNode.Order = (int)maxObj + 1;
                else
                    vData.DecisionNode.Order = 0;

                AttributeValueEntity ave = new AttributeValueEntity();
                ave.AttributeMatch = vData.DecisionNode;
                ave.Literal = true;
                ave.Value = string.Empty;
            }
            vData.DecisionNode.ParentId = id2;
            vData.DecisionNode.AttributeId = int.Parse(collection["AttributeId"]);

            if (vData.DecisionNode.Attribute.AttributeType.Name == "uri")
                vData.DecisionNode.Extra = collection["uriExtra"];
            else if (vData.DecisionNode.Attribute.AttributeType.Name == "param")
                vData.DecisionNode.Extra = collection["extra"];
            else
                vData.DecisionNode.Extra = string.Empty;

            vData.DecisionNode.Save(true);

            TempData["message"] = policyData.detailsSaved;

            return RedirectToAction("EditMatch", new { id = vData.DecisionNode.Id, linkId = linkId });
        }

        [AcceptVerbs(HttpVerbs.Post), ValidateInput(false)]
        public ActionResult UpdateAttributeValue(policyData vData, int id, int valueId, int linkId, FormCollection collection)
        {
            AttributeValueEntity attrValue = new AttributeValueEntity(valueId);

            if (attrValue.Literal)
            {
                attrValue.Value = collection["Literal"];
            }
            else
            {
                if (collection["LookupId"] != null && collection["LookupId"] != string.Empty)
                    attrValue.AttributeId = int.Parse(collection["LookupId"]);
                else
                    attrValue.AttributeId = null;
            }

            attrValue.Save();

            TempData["message"] = policyData.detailsSaved;

            return RedirectToAction("EditMatch", new { id = id, linkId = linkId });
        }

        [AcceptVerbs(HttpVerbs.Post),ValidateInput(false)]
        public ActionResult ValueOrder(policyData vData, int id, int id2, int linkId, FormCollection collection)
        {
            AttributeValueEntity attrValue = new AttributeValueEntity(id2);
            AttributeValueCollection coll = new AttributeValueCollection();

            PredicateExpression pe = new PredicateExpression(AttributeValueFields.Id != attrValue.Id);
            pe.Add(AttributeValueFields.AttributeMatchId == id);
            SortExpression se = null;

            if (collection["up"] != null)
            {
                // Find all categories with display index less than ours.
                pe.Add(AttributeValueFields.Order <= attrValue.Order);

                // Order by display index, highest first.
                se = new SortExpression(AttributeValueFields.Order | SortOperator.Descending);
            }
            else
            {
                // Find all categories with display index greater than ours.
                pe.Add(AttributeValueFields.Order >= attrValue.Order);

                // Order by display index, lowest first.
                se = new SortExpression(AttributeValueFields.Order | SortOperator.Ascending);
            }

            // Swap with closest one.
            if (coll.GetMulti(pe, 1, se) && coll.Count > 0)
            {
                int temp = coll[0].Order;
                coll[0].Order = attrValue.Order;
                attrValue.Order = temp;

                attrValue.Save();
                coll.SaveMulti();
            }

            return RedirectToAction("EditMatch", new { id = id, linkId = linkId });
        }

        [AcceptVerbs(HttpVerbs.Post), ValidateInput(false)]
        public ActionResult DecisionNodeOrder(policyData vData, int id, int id2, int linkId, FormCollection collection)
        {
            DecisionNodeEntity match = new DecisionNodeEntity(id2);
            DecisionNodeCollection coll = new DecisionNodeCollection();

            PredicateExpression pe = new PredicateExpression(DecisionNodeFields.Id != match.Id);
            pe.Add(DecisionNodeFields.ParentId == id);
            SortExpression se = null;

            if (collection["up"] != null)
            {
                // Find all categories with display index less than ours.
                pe.Add(DecisionNodeFields.Order <= match.Order);

                // Order by display index, highest first.
                se = new SortExpression(DecisionNodeFields.Order | SortOperator.Descending);
            }
            else
            {
                // Find all categories with display index greater than ours.
                pe.Add(DecisionNodeFields.Order >= match.Order);

                // Order by display index, lowest first.
                se = new SortExpression(DecisionNodeFields.Order | SortOperator.Ascending);
            }

            // Swap with closest one.
            if (coll.GetMulti(pe, 1, se) && coll.Count > 0)
            {
                int temp = coll[0].Order;
                coll[0].Order = match.Order;
                match.Order = temp;

                match.Save();
                coll.SaveMulti();
            }

            string action = collection["backTo"];
            if (action == "EditRule")
            {
                vData.Condition = new DecisionNodeEntity(id);
                id = vData.Condition.Rule[0].Id;
            }

            return RedirectToAction(action, new { id = id, linkId = linkId });
        }

        #endregion
    }
}
