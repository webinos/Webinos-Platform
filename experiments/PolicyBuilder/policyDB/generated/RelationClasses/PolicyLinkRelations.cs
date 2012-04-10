///////////////////////////////////////////////////////////////
// This is generated code. 
//////////////////////////////////////////////////////////////
// Code is generated using LLBLGen Pro version: 2.6
// Code is generated on: 04 March 2010 22:59:06
// Code is generated using templates: SD.TemplateBindings.SharedTemplates.NET20
// Templates vendor: Solutions Design.
// Templates version: 
//////////////////////////////////////////////////////////////
using System;
using System.Collections;
using System.Collections.Generic;
using policyDB;
using policyDB.FactoryClasses;
using policyDB.HelperClasses;
using SD.LLBLGen.Pro.ORMSupportClasses;

namespace policyDB.RelationClasses
{
	/// <summary>Implements the static Relations variant for the entity: PolicyLink. </summary>
	public partial class PolicyLinkRelations
	{
		/// <summary>CTor</summary>
		public PolicyLinkRelations()
		{
		}

		/// <summary>Gets all relations of the PolicyLinkEntity as a list of IEntityRelation objects.</summary>
		/// <returns>a list of IEntityRelation objects</returns>
		public virtual List<IEntityRelation> GetAllRelations()
		{
			List<IEntityRelation> toReturn = new List<IEntityRelation>();
			toReturn.Add(this.PolicyDocumentEntityUsingPolicyLinkId);
			toReturn.Add(this.PolicyLinkEntityUsingParentId);

			toReturn.Add(this.PolicyEntityUsingPolicyId);
			toReturn.Add(this.PolicyLinkEntityUsingIdParentId);
			return toReturn;
		}

		#region Class Property Declarations

		/// <summary>Returns a new IEntityRelation object, between PolicyLinkEntity and PolicyDocumentEntity over the 1:n relation they have, using the relation between the fields:
		/// PolicyLink.Id - PolicyDocument.PolicyLinkId
		/// </summary>
		public virtual IEntityRelation PolicyDocumentEntityUsingPolicyLinkId
		{
			get
			{
				IEntityRelation relation = new EntityRelation(SD.LLBLGen.Pro.ORMSupportClasses.RelationType.OneToMany, "PolicyDocument" , true);
				relation.AddEntityFieldPair(PolicyLinkFields.Id, PolicyDocumentFields.PolicyLinkId);
				relation.InheritanceInfoPkSideEntity = InheritanceInfoProviderSingleton.GetInstance().GetInheritanceInfo("PolicyLinkEntity", true);
				relation.InheritanceInfoFkSideEntity = InheritanceInfoProviderSingleton.GetInstance().GetInheritanceInfo("PolicyDocumentEntity", false);
				return relation;
			}
		}

		/// <summary>Returns a new IEntityRelation object, between PolicyLinkEntity and PolicyLinkEntity over the 1:n relation they have, using the relation between the fields:
		/// PolicyLink.Id - PolicyLink.ParentId
		/// </summary>
		public virtual IEntityRelation PolicyLinkEntityUsingParentId
		{
			get
			{
				IEntityRelation relation = new EntityRelation(SD.LLBLGen.Pro.ORMSupportClasses.RelationType.OneToMany, "Children" , true);
				relation.AddEntityFieldPair(PolicyLinkFields.Id, PolicyLinkFields.ParentId);
				relation.InheritanceInfoPkSideEntity = InheritanceInfoProviderSingleton.GetInstance().GetInheritanceInfo("PolicyLinkEntity", true);
				relation.InheritanceInfoFkSideEntity = InheritanceInfoProviderSingleton.GetInstance().GetInheritanceInfo("PolicyLinkEntity", false);
				return relation;
			}
		}


		/// <summary>Returns a new IEntityRelation object, between PolicyLinkEntity and PolicyEntity over the m:1 relation they have, using the relation between the fields:
		/// PolicyLink.PolicyId - Policy.Id
		/// </summary>
		public virtual IEntityRelation PolicyEntityUsingPolicyId
		{
			get
			{
				IEntityRelation relation = new EntityRelation(SD.LLBLGen.Pro.ORMSupportClasses.RelationType.ManyToOne, "Policy", false);
				relation.AddEntityFieldPair(PolicyFields.Id, PolicyLinkFields.PolicyId);
				relation.InheritanceInfoPkSideEntity = InheritanceInfoProviderSingleton.GetInstance().GetInheritanceInfo("PolicyEntity", false);
				relation.InheritanceInfoFkSideEntity = InheritanceInfoProviderSingleton.GetInstance().GetInheritanceInfo("PolicyLinkEntity", true);
				return relation;
			}
		}
		/// <summary>Returns a new IEntityRelation object, between PolicyLinkEntity and PolicyLinkEntity over the m:1 relation they have, using the relation between the fields:
		/// PolicyLink.ParentId - PolicyLink.Id
		/// </summary>
		public virtual IEntityRelation PolicyLinkEntityUsingIdParentId
		{
			get
			{
				IEntityRelation relation = new EntityRelation(SD.LLBLGen.Pro.ORMSupportClasses.RelationType.ManyToOne, "Parent", false);
				relation.AddEntityFieldPair(PolicyLinkFields.Id, PolicyLinkFields.ParentId);
				relation.InheritanceInfoPkSideEntity = InheritanceInfoProviderSingleton.GetInstance().GetInheritanceInfo("PolicyLinkEntity", false);
				relation.InheritanceInfoFkSideEntity = InheritanceInfoProviderSingleton.GetInstance().GetInheritanceInfo("PolicyLinkEntity", true);
				return relation;
			}
		}

		/// <summary>stub, not used in this entity, only for TargetPerEntity entities.</summary>
		public virtual IEntityRelation GetSubTypeRelation(string subTypeEntityName) { return null; }
		/// <summary>stub, not used in this entity, only for TargetPerEntity entities.</summary>
		public virtual IEntityRelation GetSuperTypeRelation() { return null;}

		#endregion

		#region Included Code

		#endregion
	}
}
